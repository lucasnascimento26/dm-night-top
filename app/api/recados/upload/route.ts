import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

const AUDIO_EXT = ["mp3", "m4a", "aac", "wav", "ogg", "opus", "flac", "webm"];
const IMAGE_EXT = ["jpg", "jpeg", "png", "webp", "gif", "heic", "heif"];

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const ext = pathname.split(".").pop()?.toLowerCase() ?? "";
        const isMusica = pathname.startsWith("recados/musica-");
        const isFoto = pathname.startsWith("recados/foto-");

        if (isMusica && !AUDIO_EXT.includes(ext)) {
          throw new Error(`Formato de áudio não aceito: .${ext}`);
        }
        if (isFoto && !IMAGE_EXT.includes(ext)) {
          throw new Error(`Formato de imagem não aceito: .${ext}`);
        }

        return {
          allowedContentTypes: [
            // imagens
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
            "image/heic",
            "image/heif",
            // áudio
            "audio/mpeg", // .mp3
            "audio/mp4", // .m4a
            "audio/x-m4a", // .m4a (Safari/Windows)
            "audio/aac",
            "audio/wav",
            "audio/x-wav",
            "audio/ogg", // .ogg / .opus (WhatsApp)
            "audio/opus",
            "audio/webm",
            "audio/flac",
            "audio/x-flac",
            // fallback: Windows às vezes não reconhece a extensão
            // e manda o MIME genérico. A extensão já foi validada acima.
            "application/octet-stream",
          ],
          maximumSizeInBytes: 25 * 1024 * 1024, // 25MB
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {
        // opcional: dá pra logar aqui se quiser
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("[upload] falhou:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}