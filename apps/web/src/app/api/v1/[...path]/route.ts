import { NextRequest, NextResponse } from 'next/server';

const API_BASE =
  process.env.API_URL?.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '') ||
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '') ||
  'https://ropa-tienda.onrender.com';

async function proxy(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const targetPath = '/' + (path || []).join('/');
  const search = req.nextUrl.search;
  const targetUrl = `${API_BASE}/api/v1${targetPath}${search}`;

  const forwardHeaders = new Headers();
  req.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (!['host', 'connection', 'content-length'].includes(lower)) {
      forwardHeaders.set(key, value);
    }
  });

  const body = ['GET', 'HEAD'].includes(req.method) ? undefined : await req.arrayBuffer();

  try {
    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
      body,
      redirect: 'manual',
      cache: 'no-store'
    });

    const responseHeaders = new Headers();
    upstream.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'set-cookie') {
        responseHeaders.append(key, value);
      } else if (!['content-encoding', 'transfer-encoding'].includes(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    });

    const responseBody = await upstream.arrayBuffer();
    return new NextResponse(responseBody, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders
    });
  } catch (error) {
    console.error('API_PROXY_ERROR:', error);
    return NextResponse.json(
      { statusCode: 502, message: 'No se pudo conectar con el servidor de la tienda.' },
      { status: 502 }
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
