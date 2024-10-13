  // Canvas and Context Creation
const canvas: HTMLCanvasElement = document.createElement('canvas');
const ctx = canvas.getContext('2d');
const fontSize = 30; 

// Type and Interface Declarations
type ItemType = 'rock' | 'paper' | 'scissors';
interface Item {
  type: ItemType;
  emoji: string;
  x: number;
  y: number;
  dx: number;
  dy: number;
}

const emojis: string[] = ['🪨', '📜', '✌️'];
const items: Item[] = [];

if (ctx) {
  document.body.appendChild(canvas);
  canvas.width = 500;
  canvas.height = 600;
  canvas.style.position = 'absolute';
  canvas.style.top = '50%';
  canvas.style.left = '50%';
  canvas.style.transform = 'translate(-50%, -50%)';

  // Create emojis
  for (let i = 0; i < 15; i++) {
    items.push({ 
      type: 'rock', 
      emoji: emojis[0], 
      x: Math.random() * canvas.width, 
      y: Math.random() * canvas.height, 
      dx: Math.random() * 4 - 2, 
      dy: Math.random() * 4 - 2 
    });
    items.push({ 
      type: 'paper', 
      emoji: emojis[1], 
      x: Math.random() * canvas.width, 
      y: Math.random() * canvas.height, 
      dx: Math.random() * 4 - 2, 
      dy: Math.random() * 4 - 2 
    });

    // Ensure minimum velocity for dx and dy
    if (Math.abs(items[items.length - 1].dx) < 0.5) {
      items[items.length - 1].dx = (items[items.length - 1].dx < 0 ? -1 : 1) * 0.5;
    }
    if (Math.abs(items[items.length - 1].dy) < 0.5) {
      items[items.length - 1].dy = (items[items.length - 1].dy < 0 ? -1 : 1) * 0.5;
    }

    items.push({ 
      type: 'scissors', 
      emoji: emojis[2], 
      x: Math.random() * canvas.width, 
      y: Math.random() * canvas.height, 
      dx: Math.random() * 4 - 2, 
      dy: Math.random() * 4 - 2 
    });
  }
  
  gameLoop(ctx);

} else {
  throw new Error('Could not get canvas context');
}

// Helper Functions
function drawItems(ctx: CanvasRenderingContext2D): void {
  ctx.font = `${fontSize}px Arial`;
  ctx.textBaseline = 'top'; // Add this line to set the baseline to 'top'
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  items.forEach((item) => {
    ctx.fillText(item.emoji, item.x, item.y);
  });
}

function determineWinner(item1: Item, item2: Item): Item | 'tie' {
  if (item1.type === item2.type) {
    return 'tie';
  }
  if (
    (item1.type === 'rock' && item2.type === 'scissors') ||
    (item1.type === 'paper' && item2.type === 'rock') ||
    (item1.type === 'scissors' && item2.type === 'paper')
  ) {
    return item1;
  } else {
    return item2;
  }
}

function updatePositions(ctx: CanvasRenderingContext2D): void {
  items.forEach((item) => {
    item.x += item.dx;
    item.y += item.dy;

    // Bounce off walls
    if (item.x <= 0) {
      item.x = 0; // Adjust to stay within bounds
      item.dx *= -1;
    } else if (item.x + fontSize >= canvas.width) {
      item.x = canvas.width - fontSize; // Adjust to stay within bounds
      item.dx *= -1;
    }
    if (item.y <= 0) {
      item.y = 0; // Adjust to stay within bounds
      item.dy *= -1;
    } else if (item.y + fontSize >= canvas.height) {
      item.y = canvas.height - fontSize; // Adjust to stay within bounds
      item.dy *= -1;
    }
  });
}

function checkCollisions(): void {
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const item1 = items[i];
      const item2 = items[j];
      const distance = Math.sqrt(Math.pow(item1.x - item2.x, 2) + Math.pow(item1.y - item2.y, 2));
      if (distance < 30) { // Collision detected
        if (item1.type !== item2.type) {
          const winner = determineWinner(item1, item2);
          if (winner !== 'tie') {
            item1.type = winner.type;
            item1.emoji = winner.emoji;
            item2.type = winner.type;
            item2.emoji = winner.emoji;
          }
        } else {
          // Bounce off each other
         item1.dx = -item1.dx + (Math.random() - 0.5) * 0.5;
         item1.dy = -item1.dy + (Math.random() - 0.5) * 0.5;
         item2.dx = -item2.dx + (Math.random() - 0.5) * 0.5;
         item2.dy = -item2.dy + (Math.random() - 0.5) * 0.5;

          // Apply minimum separation force
          const overlap = 30 - distance; // How much they overlap
          const pushX = (item1.x - item2.x) / distance * overlap / 2;
          const pushY = (item1.y - item2.y) / distance * overlap / 2;
          item1.x += pushX;
          item1.y += pushY;
          item2.x -= pushX;
          item2.y -= pushY;

        }
      }
    }
  }
}

function checkForWinner(): string | null {
  const firstType = items[0].type;
  if (items.every(item => item.type === firstType)) {
    return firstType;
  }
  return null;
}

// Main Game Loop Function
function gameLoop(ctx: CanvasRenderingContext2D): void {
  updatePositions(ctx);
  checkCollisions();
  drawItems(ctx);

  const winner = checkForWinner();
  if (winner) {
    ctx.font = 'bold 50px Arial';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle'; 

    // Draw a background rectangle
    ctx.fillStyle = 'white';
    ctx.fillRect((canvas.width / 2) - 150, (canvas.height / 2) - 40, 300, 80);
  
    // Draw the winner text
    ctx.fillStyle = 'red';
    ctx.fillText(` ${winner.toUpperCase()} WINS!`, canvas.width / 2, canvas.height / 2);
  } else {
    requestAnimationFrame(() => gameLoop(ctx));
  }
}
