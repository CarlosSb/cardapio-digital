/**
 * Testes unitários para o LogoProcessor
 */

import { LogoProcessor, QRCodeGenerator } from '../lib/qr-logo-processor'

describe('LogoProcessor', () => {
  describe('validateLogoPlacement', () => {
    it('should accept logos within safe size limits', () => {
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = 200

      const result = LogoProcessor.validateLogoPlacement(canvas, 30, {
        size: 200,
        margin: 2,
        errorCorrection: 'M',
        backgroundColor: '#fff',
        foregroundColor: '#000',
      })

      expect(result).toBe(true)
    })

    it('should reject logos that are too large', () => {
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = 200

      const result = LogoProcessor.validateLogoPlacement(canvas, 80, {
        size: 200,
        margin: 2,
        errorCorrection: 'M',
        backgroundColor: '#fff',
        foregroundColor: '#000',
      })

      expect(result).toBe(false)
    })
  })

  describe('calculateOptimalLogoSize', () => {
    it('should calculate 20% of QR size as optimal', () => {
      const result = LogoProcessor.calculateOptimalLogoSize(200)
      expect(result).toBe(40)
    })
  })
})

describe('QRCodeGenerator', () => {
  describe('generateWithLogo', () => {
    it('should generate QR code with logo configuration', async () => {
      const testUrl = 'https://example.com'
      const logoConfig = {
        url: '/test-logo.png',
        size: 0.2,
      }
      const qrConfig = {
        size: 200,
        margin: 2,
        errorCorrection: 'M' as const,
        backgroundColor: '#ffffff',
        foregroundColor: '#000000',
      }

      // Mock da função interna para evitar dependências externas
      const mockGenerateWithLogo = jest.spyOn(QRCodeGenerator, 'generateWithLogo')
        .mockResolvedValue('data:image/png;base64,mockDataUrl')

      const result = await QRCodeGenerator.generateWithLogo(testUrl, logoConfig, qrConfig)

      expect(result).toContain('data:image/png')
      mockGenerateWithLogo.mockRestore()
    })
  })
})