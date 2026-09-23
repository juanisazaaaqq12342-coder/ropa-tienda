# Seguridad y operación

Las contraseñas se almacenan como hash. La autorización se realiza en la API; los botones y rutas visibles del frontend no sustituyen esta comprobación. Las cookies de sesión son HttpOnly y adoptan medidas de producción según el entorno. La recuperación usa tokens con expiración; Google requiere configuración OAuth real.

Los cambios de catálogo, stock, pedido, revisión de pago y roles pasan por endpoints protegidos. Las consultas de pedidos y comprobantes comprueban al propietario o al personal autorizado. El checkout obtiene precios de la base de datos, guarda snapshots y protege los reintentos mediante idempotencia.

Los comprobantes aceptan JPEG, PNG o PDF de hasta 5 MB; la API verifica sus firmas y los conserva en almacenamiento privado con nombres internos. La aplicación no interpreta archivos como código ni utiliza el nombre original como ruta. La aprobación de un pago es una acción administrativa separada y auditada.

La base de datos local solo escucha en loopback. `.env`, datos, comprobantes y correo de desarrollo se excluyen del repositorio y de la imagen Docker. Las credenciales de CI corresponden únicamente a una base efímera creada por el job.

Antes de apertura comercial: configura HTTPS y orígenes exactos, SMTP y OAuth de producción, almacenamiento persistente privado, copias cifradas y restauración probada. Cambia las credenciales de desarrollo, elimina los datos ficticios en una base separada, revisa las dependencias y prueba permisos con cuentas de cada rol. Configura alertas operativas sin registrar contraseñas, tokens o el contenido completo de comprobantes.

Los archivos legales y políticas comerciales requieren datos y aprobación del negocio; las plantillas técnicas no constituyen asesoría jurídica. No se ha afirmado una certificación de seguridad o accesibilidad.
