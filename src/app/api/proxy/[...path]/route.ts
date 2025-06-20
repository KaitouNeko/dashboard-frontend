import { NextRequest, NextResponse } from 'next/server';

const DROPLET_BASE_URL = 'http://134.199.210.228:2469';

export async function GET(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return handleProxy(req, path);
}

export async function POST(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params; 
  return handleProxy(req, path);
}

export async function PUT(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params; 
  return handleProxy(req, path);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params; 
  return handleProxy(req, path);
}

async function handleProxy(req: NextRequest, pathParts: string[]) {
  const targetUrl = `${DROPLET_BASE_URL}/${pathParts.join('/')}`;
  const method = req.method || 'GET';
  const headers = new Headers(req.headers);
  headers.delete('host'); // 避免 host header 問題

  const body = ['GET', 'HEAD'].includes(method) ? undefined : await req.text();

  const response = await fetch(targetUrl, {
    method,
    headers,
    body,
  });

  const resBody = await response.arrayBuffer();

  return new NextResponse(resBody, {
    status: response.status,
    headers: response.headers,
  });
}