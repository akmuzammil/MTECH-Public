# classify_image.py
import sys
import json
from PIL import Image
import torch
import open_clip

def classify(image_path, text_prompt):
    model, _, preprocess = open_clip.create_model_and_transforms(
        'hf-hub:microsoft/BiomedCLIP-PubMedBERT_256-vit_base_patch16_224'
    )
    tokenizer = open_clip.get_tokenizer('hf-hub:microsoft/BiomedCLIP-PubMedBERT_256-vit_base_patch16_224')

    image = preprocess(Image.open(image_path).convert("RGB")).unsqueeze(0)
    text = tokenizer([text_prompt])

    with torch.no_grad(), torch.cuda.amp.autocast():
        image_features = model.encode_image(image)
        text_features = model.encode_text(text)

        logits_per_image, logits_per_text = model(image, text)
        probs = logits_per_image.softmax(dim=-1).cpu().numpy()

    return {
        "probabilities": probs[0].tolist()
    }

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(json.dumps({ "error": "Usage: classify_image.py <image_path> <text_prompt>" }))
        sys.exit(1)

    image_path = sys.argv[1]
    text_prompt = sys.argv[2]

    result = classify(image_path, text_prompt)
    print(json.dumps(result))
