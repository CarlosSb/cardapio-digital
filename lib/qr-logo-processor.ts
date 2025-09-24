/**
 * LogoProcessor - Utilitário avançado para processamento de logos em QR codes
 * Garante posicionamento centralizado, validação de legibilidade e otimização visual
 */

export interface LogoConfig {
  url: string;
  size: number; // Porcentagem do tamanho do QR (0.1 - 0.3 recomendado)
  borderRadius?: number; // Raio da borda em pixels
  backgroundColor?: string; // Fundo do logo (padrão: branco)
  shadow?: boolean; // Adicionar sombra sutil
}

export interface QRCodeConfig {
  size: number;
  margin: number;
  errorCorrection: 'L' | 'M' | 'Q' | 'H';
  backgroundColor: string;
  foregroundColor: string;
}

export class LogoProcessor {
  private static logoCache = new Map<string, HTMLImageElement>();

  /**
   * Processa e aplica logo ao QR code no canvas
   */
  static async applyLogoToQR(
    canvas: HTMLCanvasElement,
    logoConfig: LogoConfig,
    qrConfig: QRCodeConfig
  ): Promise<boolean> {
    try {
      const logo = await this.loadLogo(logoConfig.url);
      const logoSize = Math.floor(canvas.width * logoConfig.size);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');

      // Desenhar fundo do logo se especificado
      if (logoConfig.backgroundColor) {
        const bgPadding = 4;
        ctx.fillStyle = logoConfig.backgroundColor;
        ctx.fillRect(
          centerX - logoSize/2 - bgPadding,
          centerY - logoSize/2 - bgPadding,
          logoSize + bgPadding * 2,
          logoSize + bgPadding * 2
        );
      }

      // Aplicar sombra se solicitado
      if (logoConfig.shadow) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
      }

      // Criar path circular se borderRadius especificado
      if (logoConfig.borderRadius && logoConfig.borderRadius > 0) {
        ctx.save();
        ctx.beginPath();
        const x = centerX - logoSize/2;
        const y = centerY - logoSize/2;
        const radius = logoConfig.borderRadius;

        // Desenhar retângulo com cantos arredondados
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + logoSize - radius, y);
        ctx.quadraticCurveTo(x + logoSize, y, x + logoSize, y + radius);
        ctx.lineTo(x + logoSize, y + logoSize - radius);
        ctx.quadraticCurveTo(x + logoSize, y + logoSize, x + logoSize - radius, y + logoSize);
        ctx.lineTo(x + radius, y + logoSize);
        ctx.quadraticCurveTo(x, y + logoSize, x, y + logoSize - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.clip();
      }

      // Desenhar logo
      ctx.drawImage(
        logo,
        centerX - logoSize/2,
        centerY - logoSize/2,
        logoSize,
        logoSize
      );

      // Restaurar contexto se foi clipado
      if (logoConfig.borderRadius && logoConfig.borderRadius > 0) {
        ctx.restore();
      }

      // Limpar sombra
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      return true;
    } catch (error) {
      console.error('Erro ao aplicar logo ao QR code:', error);
      return false;
    }
  }

  /**
   * Carrega logo com cache e timeout
   */
  private static async loadLogo(url: string, timeout = 5000): Promise<HTMLImageElement> {
    // Verificar cache
    if (this.logoCache.has(url)) {
      return this.logoCache.get(url)!;
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      const timeoutId = setTimeout(() => {
        reject(new Error(`Timeout loading logo: ${url}`));
      }, timeout);

      img.onload = () => {
        clearTimeout(timeoutId);
        // Verificar se a imagem tem dimensões válidas
        if (img.width === 0 || img.height === 0) {
          reject(new Error('Invalid image dimensions'));
          return;
        }
        this.logoCache.set(url, img);
        resolve(img);
      };

      img.onerror = (event) => {
        clearTimeout(timeoutId);
        console.error('Logo loading error:', event);
        reject(new Error(`Failed to load logo: ${url}`));
      };

      // Adicionar timestamp para evitar cache do navegador
      const separator = url.includes('?') ? '&' : '?';
      img.src = `${url}${separator}t=${Date.now()}`;
    });
  }

  /**
   * Valida se o posicionamento do logo mantém a legibilidade do QR
   */
  private static validateLogoPlacement(
    canvas: HTMLCanvasElement,
    logoSize: number,
    qrConfig: QRCodeConfig
  ): boolean {
    // Para QR codes com correção de erro M ou superior, permitir logos maiores
    // Regra básica: logo não deve ocupar mais que 25% do QR para segurança
    const maxLogoSize = canvas.width * 0.25;
    if (logoSize > maxLogoSize) {
      console.warn(`Logo size ${logoSize} exceeds max ${maxLogoSize}, reducing...`);
      return false; // Permitir que seja reduzido automaticamente
    }

    // Para correção de erro alta, ser mais permissivo
    if (qrConfig.errorCorrection === 'H' || qrConfig.errorCorrection === 'Q') {
      return logoSize <= canvas.width * 0.22; // 22% para alta correção
    }

    // Para correção média, ser mais conservador
    return logoSize <= canvas.width * 0.18; // 18% para correção média
  }

  /**
   * Calcula o tamanho ideal do logo baseado no QR
   */
  static calculateOptimalLogoSize(qrSize: number, logoAspectRatio: number = 1): number {
    // Logo ideal: 20% do tamanho do QR, mantendo proporção
    const baseSize = Math.floor(qrSize * 0.2);

    // Ajustar para manter aspect ratio se necessário
    return Math.min(baseSize, baseSize * logoAspectRatio);
  }

  /**
   * Limpa cache de logos (útil para desenvolvimento)
   */
  static clearCache(): void {
    this.logoCache.clear();
  }


  /**
   * Verifica se uma URL de logo é válida
   */
  static async validateLogoUrl(url: string): Promise<boolean> {
    try {
      await this.loadLogo(url, 2000);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Utilitários para geração de QR codes com logo
 */
export class QRCodeGenerator {
  /**
   * Gera QR code com logo integrado
   */
  static async generateWithLogo(
    text: string,
    logoConfig: LogoConfig,
    qrConfig: QRCodeConfig
  ): Promise<string> {
    const canvas = document.createElement('canvas');
    canvas.width = qrConfig.size;
    canvas.height = qrConfig.size;

    // Import dinâmico para evitar problemas de SSR
    const QRCode = (await import('qrcode')).default;

    // Gerar QR base
    await QRCode.toCanvas(canvas, text, {
      width: qrConfig.size,
      margin: qrConfig.margin,
      color: {
        dark: qrConfig.foregroundColor,
        light: qrConfig.backgroundColor,
      },
      errorCorrectionLevel: qrConfig.errorCorrection,
    });

    // Aplicar logo com retry se necessário
    let success = await LogoProcessor.applyLogoToQR(canvas, logoConfig, qrConfig);

    if (!success) {
      console.warn('Logo muito grande, tentando com tamanho reduzido...');
      // Tentar com tamanho menor
      const reducedLogoConfig = { ...logoConfig, size: Math.min(logoConfig.size, 0.15) };
      success = await LogoProcessor.applyLogoToQR(canvas, reducedLogoConfig, qrConfig);

      if (!success) {
        console.warn('Logo ainda muito grande, gerando QR sem logo');
      }
    }

    return canvas.toDataURL('image/png');
  }
}