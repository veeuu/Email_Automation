import express from 'express'
import { verifyToken } from '../middleware/auth.js'

const router = express.Router()

// Get Canva design HTML
router.get('/design/:designId', verifyToken, async (req, res) => {
  try {
    const { designId } = req.params
    const canvaApiKey = process.env.CANVA_API_KEY

    if (!canvaApiKey) {
      return res.status(500).json({ detail: 'Canva API key not configured' })
    }

    // Fetch design from Canva API
    const response = await fetch(`https://api.canva.com/v1/designs/${designId}`, {
      headers: {
        'Authorization': `Bearer ${canvaApiKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      return res.status(response.status).json({ detail: 'Failed to fetch Canva design' })
    }

    const design = await response.json()

    // Convert Canva design to HTML
    const html = convertCanvaToHtml(design)

    res.json({ html, designId })
  } catch (error) {
    console.error('Error fetching Canva design:', error)
    res.status(500).json({ detail: 'Error processing Canva design' })
  }
})

// Helper function to convert Canva design to HTML
function convertCanvaToHtml(design) {
  // This is a basic conversion - you may need to enhance based on Canva's design structure
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .canva-design { max-width: 600px; margin: 0 auto; }
      </style>
    </head>
    <body>
      <div class="canva-design">
  `

  // Add design content
  if (design.pages && design.pages.length > 0) {
    design.pages.forEach(page => {
      if (page.elements) {
        page.elements.forEach(element => {
          html += convertElement(element)
        })
      }
    })
  }

  html += `
      </div>
    </body>
    </html>
  `

  return html
}

function convertElement(element) {
  let html = ''

  switch (element.type) {
    case 'text':
      html = `<p style="font-size: ${element.fontSize}px; color: ${element.color};">${element.text}</p>`
      break
    case 'image':
      html = `<img src="${element.src}" style="max-width: 100%; height: auto;" />`
      break
    case 'shape':
      html = `<div style="background-color: ${element.backgroundColor}; width: ${element.width}px; height: ${element.height}px;"></div>`
      break
    default:
      html = ''
  }

  return html
}

export default router
