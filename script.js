// Get canvas and context references
const canvas = document.getElementById('pieChart');
const ctx = canvas.getContext('2d');

// Function to draw the wheel and its segments
function drawWheel(segments) {
    const radius = canvas.width / 2;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    let startAngle = 0;

    // Clear the canvas before drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw each segment and number
    segments.forEach((segment) => {
        const endAngle = startAngle + (2 * Math.PI) / segments.length;

        // Draw the segment
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = segment.color;
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Calculate the position for the number
        const angle = startAngle + (endAngle - startAngle) / 2;
        const textX = centerX + (radius * 0.7) * Math.cos(angle);
        const textY = centerY + (radius * 0.7) * Math.sin(angle);

        // Draw the number
        ctx.font = `${Math.floor(radius / 10)}px Arial`;
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(segment.value, textX, textY);

        startAngle = endAngle; // Move to the next segment
    });
}

// Example segments data
const segments = [
    { color: '#FF0000', value: '10' },
    { color: '#00FF00', value: '20' },
    { color: '#0000FF', value: '30' },
    { color: '#FFFF00', value: '40' },
    { color: '#FF00FF', value: '50' }
];

// Draw the wheel once with fixed size
drawWheel(segments);
