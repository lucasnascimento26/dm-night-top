import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
            "audio/mpeg",
            "audio/mp3",
            "audio/wav",
            "audio/ogg",
          ],
          maximumSizeInBytes: 20 * 1024 * 1024, // 20MB
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {
        // opcional: dá pra logar aqui se quiser
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}