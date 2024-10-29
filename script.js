
        let segmentColors = {};
        let categories = [];

        document.addEventListener('DOMContentLoaded', () => {
            const inputsDiv = document.getElementById('inputs');

            // Generate 10 input boxes for competencies
            for (let i = 1; i <= 10; i++) {
                const inputContainer = document.createElement('div');
                const input = document.createElement('input');
                input.type = 'text';
                input.placeholder = `Competency ${i}`;
                input.dataset.index = i; // Save index in data attribute
                inputContainer.appendChild(input);
                inputsDiv.appendChild(inputContainer);

                input.addEventListener('input', (event) => {
                    const titleCasedValue = toTitleCase(event.target.value);
                    event.target.value = titleCasedValue;
                });

                input.addEventListener('focus', (event) => {
                    const index = event.target.dataset.index - 1;
                    const colors = generateColors(10);
                    event.target.style.borderColor = colors[index];
                });

                input.addEventListener('blur', (event) => {
                    if (!event.target.value) {
                        event.target.style.borderColor = '#000';
                    }
                });
            }
        });

        function generatePieChart() {
            const canvas = document.getElementById('pieChart');
            const ctx = canvas.getContext('2d');
            const infoBody = document.getElementById('info-body');
            infoBody.innerHTML = ''; // Clear previous info
            categories = [];
            document.querySelectorAll('#inputs input').forEach(input => {
                if (input.value) {
                    categories.push(toTitleCase(input.value));
                }
            });

            // Generate unsaturated colors
            const colors = generateColors(categories.length);

            // Create competency info elements
            categories.forEach((category, index) => {
                const row = document.createElement('tr');
                const categoryCell = document.createElement('td');
                const valueCell = document.createElement('td');

                const color = colors[index];
                categoryCell.innerHTML = `<div class="category-cell"><div class="color-box" style="background-color: ${color};"></div>${category}</div>`;
                valueCell.textContent = '0';
                valueCell.dataset.category = category;
                valueCell.classList.add('value-column');

                row.appendChild(categoryCell);
                row.appendChild(valueCell);
                infoBody.appendChild(row);
            });

            const numCategories = categories.length;
            const radius = (canvas.width / 2) * 0.9075; // 90.75% of the original radius
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const angleStep = (2 * Math.PI) / numCategories;

            // Clear the canvas and remove old buttons
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            document.querySelectorAll('.segment-value').forEach(button => button.remove());

            // Draw the white circle
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.fillStyle = '#FFFFFF';
            ctx.fill();
            ctx.stroke();

            // Initialize segment colors
            segmentColors = {};

            // Draw the pie chart and the concentric circles
            for (let i = 0; i < numCategories; i++) {
                const startAngle = i * angleStep - Math.PI / 2;
                const endAngle = startAngle + angleStep;

                // Draw the category division lines
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.arc(centerX, centerY, radius, startAngle, startAngle);
                ctx.lineTo(centerX + radius * Math.cos(startAngle), centerY + radius * Math.sin(startAngle));
                ctx.stroke();

                // Draw the concentric circles
                for (let j = 1; j <= 10; j++) {  // Set the number of circles to 10
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, (radius / 10) * j, startAngle, endAngle);
                    ctx.stroke();
                }

                // Add interactivity
                const midAngle = (startAngle + endAngle) / 2;
                for (let j = 1; j <= 10; j++) {
                    const valueX = centerX + ((radius / 10) * j) * Math.cos(midAngle);
                    const valueY = centerY + ((radius / 10) * j) * Math.sin(midAngle);
                    createValueButton(valueX, valueY, j, categories[i], canvas, startAngle, endAngle, i);
                }
            }

            // Redraw all outlines to ensure they are on top
            redrawOutlines(ctx, centerX, centerY, radius, numCategories, angleStep);

            // Draw competency names at the outer edge as straight text
            drawCategoryNames(ctx, centerX, centerY, radius, numCategories, angleStep);
        }

        function createValueButton(x, y, value, category, canvas, startAngle, endAngle, categoryIndex) {
            const button = document.createElement('div');
            button.classList.add('segment-value');
            button.style.left = `${x}px`;
            button.style.top = `${y}px`;
            button.textContent = value;

            button.addEventListener('click', () => {
                segmentColors[category] = value;
                updateCategoryInfo(category, value);
                redrawSegments(canvas);
            });

            canvas.parentElement.appendChild(button);
        }

        function updateCategoryInfo(category, value) {
            const valueCells = document.querySelectorAll(`#info-body td[data-category="${category}"]`);
            valueCells.forEach(cell => {
                cell.textContent = value;
            });
        }

        function redrawSegments(canvas) {
            const ctx = canvas.getContext('2d');
            const radius = (canvas.width / 2) * 0.9; // 90.75% of the original radius
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            // Clear the canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Redraw the white circle
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.fillStyle = '#FFFFFF';
            ctx.fill();
            ctx.stroke();

            const numCategories = categories.length;
            const angleStep = (2 * Math.PI) / numCategories;

            // Redraw all segments with their colors
            for (let i = 0; i < numCategories; i++) {
                const startAngle = i * angleStep - Math.PI / 2;
                const endAngle = startAngle + angleStep;
                const category = categories[i];

                if (segmentColors[category]) {
                    const value = segmentColors[category];
                    const color = `hsl(${(i / numCategories) * 360}, 50%, 75%)`;

                    ctx.beginPath();
                    ctx.moveTo(centerX, centerY);
                    ctx.arc(centerX, centerY, (radius / 10) * value, startAngle, endAngle);  // Adjust for 10 steps
                    ctx.lineTo(centerX, centerY);
                    ctx.closePath();
                    ctx.fillStyle = color;
                    ctx.fill();

                    // Draw the value in the middle of the segment
                    const midAngle = (startAngle + endAngle) / 2;
                    const textX = centerX + (radius / 2) * Math.cos(midAngle);
                    const textY = centerY + (radius / 2) * Math.sin(midAngle);
                    ctx.fillStyle = '#000';
                    ctx.font = '16px Arial';
                    ctx.fillText(segmentColors[category], textX - 5, textY + 5);
                }
            }

            // Redraw all outlines to ensure they are on top
            redrawOutlines(ctx, centerX, centerY, radius, numCategories, angleStep);

            // Draw competency names at the outer edge as straight text
            drawCategoryNames(ctx, centerX, centerY, radius, numCategories, angleStep);
        }

        function redrawOutlines(ctx, centerX, centerY, radius, numCategories, angleStep) {
            ctx.strokeStyle = '#000';
            // Draw category lines
            for (let i = 0; i < numCategories; i++) {
                const startAngle = i * angleStep - Math.PI / 2;
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(centerX + radius * Math.cos(startAngle), centerY + radius * Math.sin(startAngle));
                ctx.stroke();
            }
            // Draw concentric circles
            for (let j = 1; j <= 10; j++) {  // Set the number of circles to 10
                ctx.beginPath();
                ctx.arc(centerX, centerY, (radius / 10) * j, 0, 2 * Math.PI);
                ctx.stroke();
            }
        }

        function drawCategoryNames(ctx, centerX, centerY, radius, numCategories, angleStep) {
            ctx.fillStyle = '#000';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            for (let i = 0; i < numCategories; i++) {
                const angle = i * angleStep - Math.PI / 2 + angleStep / 2;
                const textRadius = radius + 20; // Position text 20px outside the radius
                const textX = centerX + textRadius * Math.cos(angle);
                const textY = centerY + textRadius * Math.sin(angle);

                ctx.save();
                ctx.translate(textX, textY);
                ctx.rotate(angle + Math.PI / 2);
                ctx.fillText(categories[i], 0, 0);
                ctx.restore();
            }
        }

        function generateColors(numColors) {
            const colors = [];
            for (let i = 0; i < numColors; i++) {
                const hue = (i * 360) / numColors;
                const color = `hsl(${hue}, 50%, 75%)`;
                colors.push(color);
            }
            return colors;
        }

        function toTitleCase(str) {
            return str.replace(/\w\S*/g, function (txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
        }

        function saveAsImage() {
    const saveButton = document.querySelector('.save-button-container');
    saveButton.style.display = 'none'; // Hide the save button

    const infoContainer = document.getElementById('info-container');
    infoContainer.style.alignItems = 'flex-start'; // Align the table to the top

    html2canvas(document.getElementById('chart-container')).then(canvas => {
        // Create a bordered canvas with extra space on the right
        const borderedCanvas = document.createElement('canvas');
        const extraSpace = 120; // Extra white space on the right
        borderedCanvas.width = canvas.width + extraSpace; 
        borderedCanvas.height = canvas.height + 40; // Keep 40px padding for top/bottom
        const borderedCtx = borderedCanvas.getContext('2d');

        // Fill the canvas with white background
        borderedCtx.fillStyle = '#FFF';
        borderedCtx.fillRect(0, 0, borderedCanvas.width, borderedCanvas.height);

        // Draw the original canvas with 20px padding on all sides
        borderedCtx.drawImage(canvas, 20, 20);

        // Save the image as a PNG
        const link = document.createElement('a');
        link.href = borderedCanvas.toDataURL('image/png');
        link.download = 'performance_wheel.png';
        link.click();

        // Restore the original state
        saveButton.style.display = 'block';
        infoContainer.style.alignItems = 'center';
    });
}

