// Icon Generator for creating app icons programmatically
// Generates proper PWA icons with the Kickoff branding

interface IconConfig {
  size: number;
  background: string;
  foreground: string;
  padding: number;
}

class IconGenerator {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  // Generate the main Kickoff icon
  generateKickoffIcon(config: IconConfig): string {
    this.canvas.width = config.size;
    this.canvas.height = config.size;

    const { size, background, foreground, padding } = config;
    const center = size / 2;
    const radius = (size - padding * 2) / 2;

    // Clear canvas
    this.ctx.clearRect(0, 0, size, size);

    // Background circle with gradient
    const gradient = this.ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, background);
    gradient.addColorStop(1, this.darkenColor(background, 0.2));

    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(center, center, radius, 0, 2 * Math.PI);
    this.ctx.fill();

    // Add subtle shadow effect
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    this.ctx.shadowBlur = 10;
    this.ctx.shadowOffsetY = 2;

    // Draw soccer ball pattern
    this.drawSoccerBall(center, center, radius * 0.7, foreground);

    // Add "K" letter overlay
    this.drawKLetter(center, center, radius * 0.4, foreground);

    return this.canvas.toDataURL('image/png');
  }

  // Draw soccer ball pattern
  private drawSoccerBall(x: number, y: number, radius: number, color: string) {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 3;
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';

    // Main circle
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.stroke();

    // Pentagon pattern (simplified soccer ball design)
    const pentagonRadius = radius * 0.3;
    this.ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      const px = x + Math.cos(angle) * pentagonRadius;
      const py = y + Math.sin(angle) * pentagonRadius;

      if (i === 0) {
        this.ctx.moveTo(px, py);
      } else {
        this.ctx.lineTo(px, py);
      }
    }
    this.ctx.closePath();
    this.ctx.fillStyle = color;
    this.ctx.fill();

    // Connecting lines
    for (let i = 0; i < 5; i++) {
      const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      const px = x + Math.cos(angle) * pentagonRadius;
      const py = y + Math.sin(angle) * pentagonRadius;

      this.ctx.beginPath();
      this.ctx.moveTo(px, py);
      this.ctx.lineTo(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);
      this.ctx.stroke();
    }
  }

  // Draw stylized "K" letter
  private drawKLetter(x: number, y: number, size: number, color: string) {
    this.ctx.strokeStyle = 'white';
    this.ctx.lineWidth = size * 0.2;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    const halfSize = size / 2;

    // Vertical line
    this.ctx.beginPath();
    this.ctx.moveTo(x - halfSize * 0.3, y - halfSize);
    this.ctx.lineTo(x - halfSize * 0.3, y + halfSize);
    this.ctx.stroke();

    // Upper diagonal
    this.ctx.beginPath();
    this.ctx.moveTo(x - halfSize * 0.3, y);
    this.ctx.lineTo(x + halfSize * 0.5, y - halfSize);
    this.ctx.stroke();

    // Lower diagonal
    this.ctx.beginPath();
    this.ctx.moveTo(x - halfSize * 0.3, y);
    this.ctx.lineTo(x + halfSize * 0.5, y + halfSize);
    this.ctx.stroke();
  }

  // Generate icon for different sizes
  generateIconSet(): { [key: string]: string } {
    const icons: { [key: string]: string } = {};
    const sizes = [16, 32, 48, 72, 96, 144, 192, 384, 512];
    const background = '#00DC82'; // Pitch green
    const foreground = '#ffffff';

    sizes.forEach(size => {
      const config: IconConfig = {
        size,
        background,
        foreground,
        padding: Math.max(4, size * 0.1)
      };

      icons[`icon-${size}x${size}.png`] = this.generateKickoffIcon(config);
    });

    return icons;
  }

  // Generate maskable icon (for adaptive icons on Android)
  generateMaskableIcon(size: number): string {
    const config: IconConfig = {
      size,
      background: '#00DC82',
      foreground: '#ffffff',
      padding: size * 0.1 // 10% safe zone for maskable icons
    };

    return this.generateKickoffIcon(config);
  }

  // Generate monochrome icon (for notification badges)
  generateMonochromeIcon(size: number): string {
    this.canvas.width = size;
    this.canvas.height = size;

    const center = size / 2;
    const radius = (size - 20) / 2;

    // Clear canvas
    this.ctx.clearRect(0, 0, size, size);

    // Single color icon
    this.ctx.fillStyle = '#ffffff';
    this.drawKLetter(center, center, radius, '#ffffff');

    return this.canvas.toDataURL('image/png');
  }

  // Utility function to darken a color
  private darkenColor(color: string, factor: number): string {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    const newR = Math.floor(r * (1 - factor));
    const newG = Math.floor(g * (1 - factor));
    const newB = Math.floor(b * (1 - factor));

    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }

  // Generate and download all icons
  downloadIconSet(): void {
    const icons = this.generateIconSet();

    Object.entries(icons).forEach(([filename, dataUrl]) => {
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });

    // Generate special icons
    const maskable192 = this.generateMaskableIcon(192);
    const maskable512 = this.generateMaskableIcon(512);
    const monochrome = this.generateMonochromeIcon(48);

    [
      { filename: 'icon-192-maskable.png', dataUrl: maskable192 },
      { filename: 'icon-512-maskable.png', dataUrl: maskable512 },
      { filename: 'icon-monochrome.png', dataUrl: monochrome }
    ].forEach(({ filename, dataUrl }) => {
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }
}

export default IconGenerator;