export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { image, prompt } = req.body;

  try {
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    const formData = new FormData();
    const blob = new Blob([imageBuffer], { type: 'image/jpeg' });
    formData.append('image', blob, 'photo.jpg');
    formData.append('prompt', prompt);
    formData.append('negative_prompt', 'blurry, bad quality, distorted');
    formData.append('strength', '0.75');
    formData.append('guidance_scale', '7.5');

    const response = await fetch(
      'https://api-inference.huggingface.co/models/timbrooks/instruct-pix2pix',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.HF_TOKEN}`,
        },
        body: formData
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`HF Error ${response.status}: ${errText}`);
    }

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    res.status(200).json({ image: `data:image/png;base64,${base64}` });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
