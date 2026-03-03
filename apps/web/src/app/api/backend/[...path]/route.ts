import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE =
  process.env.BACKEND_API_BASE ??
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://autarchdistrict.onrender.com";

function buildTargetUrl(pathParts: string[], req: NextRequest): string {
  const normalizedBase = BACKEND_BASE.replace(/\/+$/, "");
  const suffix = pathParts.join("/");
  const url = new URL(`${normalizedBase}/${suffix}`);
  req.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });
  return url.toString();
}

async function forward(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const targetUrl = buildTargetUrl(path, req);
  const body = req.method === "GET" || req.method === "HEAD" ? undefined : await req.arrayBuffer();
  const upstream = await fetch(targetUrl, {
    method: req.method,
    headers: {
      "content-type": req.headers.get("content-type") ?? "application/json"
    },
    body,
    cache: "no-store"
  });

  const responseBody = await upstream.text();
  const response = new NextResponse(responseBody, {
    status: upstream.status
  });
  const contentType = upstream.headers.get("content-type");
  if (contentType) {
    response.headers.set("content-type", contentType);
  }
  return response;
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return forward(req, ctx);
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return forward(req, ctx);
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return forward(req, ctx);
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return forward(req, ctx);
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return forward(req, ctx);
}

export async function OPTIONS(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return forward(req, ctx);
}
