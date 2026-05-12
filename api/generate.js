export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { image, prompt } = req.body;

  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/InstantX/InstantID',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: {
            image: image,
            prompt: prompt,
            negative_prompt: "blurry, bad quality, distorted face, ugly, cartoon",
            num_inference_steps: 30,
            guidance_scale: 5.0,
            width: 512,
            height: 768
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`HF Error: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({ image: `data:image/png;base64,${base64}` });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
