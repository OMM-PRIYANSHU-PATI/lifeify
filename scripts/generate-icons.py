import os
from PIL import Image, ImageDraw

def create_lifeify_icon(size):
    # Create image with alpha channel
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    scale = size / 512.0

    # 1. Rounded rectangle background (#0E7C6B -> rgb(14, 124, 107))
    radius = int(128 * scale)
    teal = (14, 124, 107, 255)
    draw.rounded_rectangle([0, 0, size, size], radius=radius, fill=teal)

    # 2. White medical heart / shield
    # Heart center points scaled
    # We can draw the heart shield using polygons/curves
    # Center (256*s, 240*s)
    heart_img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    h_draw = ImageDraw.Draw(heart_img)
    
    # Draw heart circles and triangle
    r = int(60 * scale)
    cx1 = int(216 * scale)
    cx2 = int(296 * scale)
    cy = int(200 * scale)
    bottom_y = int(380 * scale)
    center_x = int(256 * scale)

    # Left & right lobes
    h_draw.ellipse([cx1 - r, cy - r, cx1 + r, cy + r], fill=(255, 255, 255, 255))
    h_draw.ellipse([cx2 - r, cy - r, cx2 + r, cy + r], fill=(255, 255, 255, 255))
    # Bottom triangle
    h_draw.polygon([
        (cx1 - r + int(4*scale), cy + int(10*scale)),
        (cx2 + r - int(4*scale), cy + int(10*scale)),
        (center_x, bottom_y)
    ], fill=(255, 255, 255, 255))

    # Center fill
    h_draw.rectangle([cx1, cy - r, cx2, cy + r], fill=(255, 255, 255, 255))

    # 3. Medical Cross in teal inside the heart
    cross_w = max(4, int(24 * scale))
    cross_h = int(80 * scale)
    cross_y_center = int(232 * scale)

    # Vertical bar
    h_draw.rounded_rectangle([
        center_x - cross_w // 2,
        cross_y_center - cross_h // 2,
        center_x + cross_w // 2,
        cross_y_center + cross_h // 2
    ], radius=cross_w // 2, fill=teal)

    # Horizontal bar
    h_draw.rounded_rectangle([
        center_x - cross_h // 2,
        cross_y_center - cross_w // 2,
        center_x + cross_h // 2,
        cross_y_center + cross_w // 2
    ], radius=cross_w // 2, fill=teal)

    # Composite
    img.alpha_composite(heart_img)
    return img

os.makedirs('public', exist_ok=True)
create_lifeify_icon(512).save('public/icon-512.png', 'PNG')
create_lifeify_icon(192).save('public/icon-192.png', 'PNG')
create_lifeify_icon(180).save('public/apple-touch-icon.png', 'PNG')
create_lifeify_icon(64).save('public/favicon.png', 'PNG')
print('PWA icons successfully generated in public/')
