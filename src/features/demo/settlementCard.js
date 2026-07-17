import { formatPaiseCompact } from '../../utils/split.js'

const WIDTH = 1080
const HEIGHT = 1350

function drawRoundedRect(context, x, y, width, height, radius, fill, stroke) {
  context.beginPath()
  context.roundRect(x, y, width, height, radius)
  if (fill) {
    context.fillStyle = fill
    context.fill()
  }
  if (stroke) {
    context.strokeStyle = stroke
    context.lineWidth = 2
    context.stroke()
  }
}

function drawBrand(context) {
  drawRoundedRect(context, 78, 72, 64, 64, 18, '#0A2540')
  drawRoundedRect(context, 91, 89, 31, 13, 7, '#FFFFFF')
  drawRoundedRect(context, 99, 108, 31, 13, 7, '#3ECF8E')
  context.fillStyle = '#0A2540'
  context.font = '800 38px Inter, system-ui, sans-serif'
  context.fillText('SPLIT', 164, 119)
  const prefixWidth = context.measureText('SPLIT').width
  context.fillStyle = '#147A50'
  context.fillText('PE', 164 + prefixWidth, 119)
}

export function createSettlementCardCanvas(model) {
  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const context = canvas.getContext('2d')
  const viewerTransfer = model.simplifiedTransfers.find(
    (transfer) => transfer.fromMemberId === model.viewer.id,
  )
  const recipient = model.membersById[viewerTransfer.toMemberId]
  const breakdown = Object.fromEntries(
    model.viewerBreakdown.map((item) => [item.category, item.sharePaise]),
  )

  context.fillStyle = '#F6F9FC'
  context.fillRect(0, 0, WIDTH, HEIGHT)
  drawBrand(context)

  context.fillStyle = '#52606D'
  context.font = '700 25px Inter, system-ui, sans-serif'
  context.fillText('FLAT 302 · JULY SETTLEMENT', 78, 220)

  context.fillStyle = '#0A2540'
  context.font = '760 58px Inter, system-ui, sans-serif'
  context.fillText(`${model.viewer.name} pays ${recipient.name}`, 78, 320)
  context.font = '780 100px Inter, system-ui, sans-serif'
  context.fillText(formatPaiseCompact(viewerTransfer.amountPaise), 78, 435)

  context.fillStyle = '#52606D'
  context.font = '650 27px Inter, system-ui, sans-serif'
  context.fillText('YOUR BALANCE IS BASED ON', 78, 550)

  const rows = [
    ['Rent', breakdown.rent],
    ['Electricity', breakdown.electricity],
    ['Internet', breakdown.internet],
    ['Paid', -model.viewerBalance.totalPaidPaise],
  ]
  rows.forEach(([label, amountPaise], index) => {
    const y = 625 + index * 70
    context.fillStyle = '#0A2540'
    context.font = '600 31px Inter, system-ui, sans-serif'
    context.fillText(label, 78, y)
    context.textAlign = 'right'
    context.font = '750 31px Inter, system-ui, sans-serif'
    const amount = formatPaiseCompact(Math.abs(amountPaise))
    context.fillText(`${amountPaise < 0 ? '−' : ''}${amount}`, 1002, y)
    context.textAlign = 'left'
  })

  context.strokeStyle = '#DDE5EC'
  context.lineWidth = 2
  context.beginPath()
  context.moveTo(78, 872)
  context.lineTo(1002, 872)
  context.stroke()

  context.fillStyle = '#0A2540'
  context.font = '750 32px Inter, system-ui, sans-serif'
  context.fillText(
    `${model.rawRepayments.length} repayments simplified to ${model.simplifiedTransfers.length} household transfers`,
    78,
    945,
  )

  drawRoundedRect(context, 78, 1010, 924, 190, 28, '#FFFFFF', '#DDE5EC')
  context.fillStyle = '#0A2540'
  context.font = '700 29px Inter, system-ui, sans-serif'
  context.fillText('This card records a recommended settlement.', 118, 1086)
  context.fillStyle = '#52606D'
  context.font = '500 28px Inter, system-ui, sans-serif'
  context.fillText('It does not confirm payment.', 118, 1144)

  context.fillStyle = '#52606D'
  context.font = '400 22px Inter, system-ui, sans-serif'
  context.fillText('Generated from the Flat 302 demo · SPLITPE', 78, 1286)

  return canvas
}

export function createSettlementCardBlob(model) {
  const canvas = createSettlementCardCanvas(model)
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('The settlement card could not be generated.'))
    }, 'image/png')
  })
}

export async function downloadSettlementCard(model) {
  const blob = await createSettlementCardBlob(model)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'splitpe-flat-302-july-settlement.png'
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
