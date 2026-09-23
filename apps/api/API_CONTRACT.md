# LUXE WOMAN API contract

Base `/api/v1` (API port 4000). JSON, all amounts integer COP. Browser sends credentials: include; Next proxy may forward same-origin `/api/v1`. Cookie `luxe_session` is HttpOnly; guest cart cookie `luxe_cart`. Errors `{message: string, statusCode:number}`. All writes require an allowed Origin header (localhost:3000 or APP_URL); server-side writes may omit Origin. All responses below are direct objects, no extra `data` wrapper unless specified.

## Types
```ts
type User={id:string,name:string,email:string,phone:string|null,role:'CUSTOMER'|'EMPLOYEE'|'ADMIN'};
type Category={id:string,slug:string,name:string,image:string|null};
type Variant={id:string,sku:string,size:string,color:string,colorHex:string,stock:number};
type Product={id:string,slug:string,name:string,description:string,details:string,materials:string,care:string,price:number,compareAtPrice:number|null,featured:boolean,isNew:boolean,active:boolean,categoryId:string,category:Category,images:{id:string,url:string,alt:string,position:number}[],variants:Variant[],createdAt:string};
type Cart={id:string,items:{id:string,quantity:number,variant:Variant&{product:Product},lineTotal:number}[],subtotal:number,shipping:number,total:number,freeShippingThreshold:number};
type Address={id?:string,label?:string,name:string,phone:string,line1:string,line2?:string,city:string,department:string,postalCode?:string};
type Order={id:string,number:string,userId:string,status:'PENDING_PAYMENT'|'CONFIRMED'|'PREPARING'|'SHIPPED'|'DELIVERED'|'CANCELLED',paymentStatus:'PENDING'|'UNDER_REVIEW'|'APPROVED'|'REJECTED',paymentMethod:'NEQUI'|'DAVIPLATA',subtotal:number,shipping:number,total:number,address:Address,createdAt:string,items:{id:string,productName:string,productSlug:string,image:string,size:string,color:string,quantity:number,unitPrice:number}[],proofs:{id:string,originalName:string,status:string,note:string|null,createdAt:string}[],shipment:{carrier:string,trackingNumber:string|null,trackingUrl:string|null,shippedAt:string|null,deliveredAt:string|null}|null,events:{id:string,status:string,message:string,createdAt:string}[]};
type ShopSettings={brandName:string,shippingFee:number,freeShippingThreshold:number,contactEmail:string,paymentMethods:{id:'NEQUI'|'DAVIPLATA',name:string,enabled:boolean,number:string,holder:string,instructions:string}[],demoMode:boolean,googleEnabled:boolean};
```

## Public
- GET `/health` → `{status:'ok'}` (503 if DB unavailable)
- GET `/settings` → ShopSettings (seed demoMode true; payment destination deliberately unconfigured)
- GET `/categories` → Category[]
- GET `/products?search=&category=ropa&size=M&color=Marfil&minPrice=0&maxPrice=900000&inStock=true&featured=true&isNew=true&sort=newest|price-asc|price-desc|name&page=1&limit=12` → `{items:Product[],total:number,page:number,limit:number,pages:number}`. `category` accepts slug.
- GET `/products/:slug` → Product
- GET `/auth/me` → `{user:User|null}`
- POST `/auth/register` `{name,email,password,phone?}` → `{user:User}` + cookie; 8+ char password
- POST `/auth/login` `{email,password}` → `{user:User}` + cookie; cart merges
- POST `/auth/logout` `{}` → `{ok:true}`
- POST `/auth/forgot-password` `{email}` → `{message:string}`; reset links sent through configured SMTP; development mail saved privately, never returned in API
- POST `/auth/reset-password` `{token,password}` → `{message:string}`
- GET `/auth/google` redirects to Google when configured; 503 otherwise
- GET `/cart` → Cart (creates guest cart cookie)
- POST `/cart/items` `{variantId,quantity}` → Cart (adds quantity)
- PATCH `/cart/items/:id` `{quantity}` → Cart
- DELETE `/cart/items/:id` → Cart

## Signed in
- GET `/favorites` → Product[]
- POST `/favorites` `{productId}` → `{ok:true}`
- DELETE `/favorites/:productId` → `{ok:true}`
- PATCH `/account` `{name,phone?}` → `{user:User}`
- GET `/addresses` → Address[]
- POST `/addresses` Address → Address
- DELETE `/addresses/:id` → `{ok:true}`
- POST `/checkout` `{address:Address,paymentMethod:'NEQUI'|'DAVIPLATA',idempotencyKey:string}` → Order; creates DB order, reserves/decrements stock transactionally and empties cart. Retry same key returns same order. Must be signed in. Demo checkout accepts methods without real destination and clearly marks demo mode in settings.
- GET `/orders` → Order[]
- GET `/orders/:id` → Order (id or public number)
- POST `/orders/:id/proof` multipart field `file` (JPEG, PNG, PDF; <=5MB; verified signature) → Order, requires pending/rejected payment. User owns order. Private file.
- GET `/proofs/:id/file` returns private attachment to owner/admin only.

## Administration (ADMIN; EMPLOYEE catalog/order logistics only)
- GET `/admin/metrics` → `{revenue,orders,customers,products,pendingPayments,lowStock,recentOrders:Order[],salesByMonth:{month,total}[]}`
- GET `/admin/products` → `{items:Product[],total}`
- POST `/admin/products` `{name,slug,description,categoryId,price,compareAtPrice?,details?,materials?,care?,featured?,isNew?,active?,images:{url,alt?}[],variants:{sku,size,color,colorHex?,stock}[]}` → Product
- PATCH `/admin/products/:id` same body (full replacement metadata; existing variants updated by sku, not destructively replaced) → Product
- DELETE `/admin/products/:id` → `{ok:true}` archives product
- GET `/admin/orders` → Order[]
- GET `/admin/orders/:id` → Order
- PATCH `/admin/orders/:id` `{status?,carrier?,trackingNumber?,trackingUrl?,note?}` → Order; state transitions validated and payment must be approved before fulfillment; cancel restores stock once
- POST `/admin/orders/:id/payment` `{decision:'APPROVED'|'REJECTED',note?}` → Order; requires submitted proof, rejection note required
- GET `/admin/customers` → User[] with `_count:{orders:number}` and `createdAt`
- PATCH `/admin/customers/:id/role` `{role:'CUSTOMER'|'EMPLOYEE'|'ADMIN'}` → User; cannot remove final admin
- GET `/admin/settings` → ShopSettings
- PATCH `/admin/settings` ShopSettings (partial) → ShopSettings
- GET `/admin/audit` → `{id,actorId,action,entityId,metadata,createdAt}[]` newest 100

Swagger `/api/docs` documents available routes. Public products always active. Server prices and stock authoritative. No real customer details/production credentials are seeded.
