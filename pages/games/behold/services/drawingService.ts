
import type { Character } from '../types';
import { CharacterType } from '../types';
import { PEEP_SIZE } from '../constants';

export const drawPeepOnCanvas = (ctx: CanvasRenderingContext2D, peep: Character) => {
  const { type, shape, hasHat, event } = peep;
  
  ctx.save();

  if (type === CharacterType.FALLEN) {
    ctx.translate(PEEP_SIZE / 2, PEEP_SIZE / 2);
    ctx.rotate(Math.PI / 2);
    ctx.translate(-PEEP_SIZE / 2, -PEEP_SIZE / 2);
  }

  ctx.strokeStyle = 'black';
  ctx.lineWidth = 2;

  // Body
  if (type !== CharacterType.FALLEN) {
    const bodyW = 24;
    const bodyH = 20;
    const bodyX = (PEEP_SIZE - bodyW) / 2;
    const bodyY = PEEP_SIZE - bodyH;
    
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(bodyX, bodyY);
    ctx.lineTo(bodyX, bodyY + bodyH);
     if (shape === 'circle') {
        const radius = 12;
        ctx.arcTo(bodyX + bodyW / 2, bodyY + bodyH + radius, bodyX + bodyW, bodyY + bodyH, radius);
    }
    ctx.lineTo(bodyX + bodyW, bodyY + bodyH);
    ctx.lineTo(bodyX + bodyW, bodyY);
    ctx.stroke();
    ctx.fill();
  }

  // Head
  const headW = 40, headH = 40;
  const headX = (PEEP_SIZE - headW) / 2;
  const headY = 0;

  if (type === CharacterType.ANGRY) {
    ctx.fillStyle = '#fca5a5'; // red-300
  } else {
    ctx.fillStyle = 'white';
  }

  ctx.beginPath();
  if (shape === 'circle') {
    ctx.arc(headX + headW / 2, headY + headH / 2, headW / 2, 0, Math.PI * 2);
  } else {
    ctx.rect(headX, headY, headW, headH);
  }
  ctx.fill();
  ctx.stroke();

  if (type === CharacterType.FALLEN) {
      ctx.restore();
      return;
  }
  
  // Eyes
  ctx.fillStyle = 'black';
  const eyeY = headY + 16;
  ctx.beginPath();
  ctx.arc(headX + 14, eyeY, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(headX + 26, eyeY, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Face
  const faceY = headY + 24;
  const isYelling = event?.type === 'hat_hate' || event?.type === 'square_anger';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  
  if (isYelling) {
    ctx.fillStyle = 'black';
    ctx.rect(headX + 12, faceY + 2, 16, 10);
    ctx.fill();
  } else {
    switch (type) {
      case CharacterType.NORMAL:
        ctx.moveTo(headX + 12, faceY + 4);
        ctx.lineTo(headX + 28, faceY + 4);
        break;
      case CharacterType.ANGRY:
        ctx.moveTo(headX + 10, faceY + 4);
        ctx.lineTo(headX + 18, faceY);
        ctx.moveTo(headX + 30, faceY + 4);
        ctx.lineTo(headX + 22, faceY);
        break;
      case CharacterType.SCARED:
          ctx.arc(headX + headW/2, faceY + 2, 5, 0, Math.PI * 2);
        break;
    }
  }
  ctx.stroke();
  
  // Hat
  if (hasHat) {
    const hatCenterX = headX + headW / 2;
    const hatBaseY = headY;
    ctx.fillStyle = 'black';
    ctx.fillRect(hatCenterX - 16, hatBaseY - 2, 32, 4); // Brim
    ctx.beginPath();
    ctx.rect(hatCenterX - 10, hatBaseY - 12, 20, 10); // Top
    ctx.fill();
  }
  
  ctx.restore();
};
