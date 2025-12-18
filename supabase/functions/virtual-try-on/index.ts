import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userImage, clothingDescription } = await req.json();
    
    // Validate the user image
    if (!userImage || userImage === "data:," || userImage.length < 100) {
      throw new Error("Invalid or empty user image. Please try capturing again.");
    }

    console.log("Processing virtual try-on request...");
    console.log("Clothing description:", clothingDescription);
    console.log("User image length:", userImage.length);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    let generatedImage = null;
    let textResponse = "";
    let usingSimulation = false;

    if (!LOVABLE_API_KEY) {
      console.warn("LOVABLE_API_KEY is not configured. Using simulation mode.");
      usingSimulation = true;
    } else {
      const prompt = `You are an AI virtual try-on assistant. Take this person's photo and replace their current clothing with a ${clothingDescription}.

Critical instructions:
- Keep the person's face, hair, skin tone, body pose, and background exactly the same
- Only replace the clothing/shirt/top area with the new garment: ${clothingDescription}
- Make the new clothing look natural and realistic as if they are actually wearing it
- Maintain proper lighting, shadows, and wrinkles consistent with the pose
- The result should look like a real photograph, not edited
- Generate a full image showing the person wearing the new ${clothingDescription}`;

      try {
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-image",
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: prompt,
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: userImage,
                    },
                  },
                ],
              },
            ],
            modalities: ["image", "text"],
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("AI gateway error:", response.status, errorText);

          if (response.status === 402 || response.status === 429) {
             console.warn("Quota/Credit limit reached. Falling back to simulation mode.");
             usingSimulation = true;
          } else {
             throw new Error(`AI processing failed: ${response.statusText}`);
          }
        } else {
            const data = await response.json();
            console.log("AI response received successfully");
            generatedImage = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
            textResponse = data.choices?.[0]?.message?.content || "";
        }
      } catch (error) {
        console.error("Error calling AI service:", error);
        usingSimulation = true;
      }
    }

    if (usingSimulation || !generatedImage) {
        // Fallback/Simulation Mode
        console.log("Using simulation/fallback response");
        // In a real app, you might want to overlay the clothes or do some processing.
        // Here we will just return the original image to verify the flow works.
        generatedImage = userImage;
        textResponse = "Simulation Mode: Credits exhausted or API key missing. This is the original image.";
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        resultImage: generatedImage,
        message: textResponse 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Virtual try-on error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Something went wrong. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
