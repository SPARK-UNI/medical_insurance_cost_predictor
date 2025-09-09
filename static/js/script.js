document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('prediction-form');
    const outputElement = document.getElementById('prediction-output');
    const predictBtn = document.querySelector('.predict-btn');
    const btnText = document.querySelector('.btn-text');
    const spinner = document.querySelector('.spinner');
    const resultContainer = document.getElementById('result-container');

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        // Show loading state
        btnText.textContent = 'Đang dự đoán...';
        spinner.style.display = 'block';
        predictBtn.disabled = true;
        
        // Hide result container
        resultContainer.classList.remove('show');

        // Get form data
        const formData = {
            age: document.getElementById('age').value,
            sex: document.getElementById('sex').value,
            bmi: document.getElementById('bmi').value,
            children: document.getElementById('children').value,
            smoker: document.getElementById('smoker').value,
            region: document.getElementById('region').value
        };

        // Simulate API call for demo purposes (replace with your actual API endpoint)
        setTimeout(() => {
            // Mock prediction result based on input factors
            let baseCost = 5000;
            
            // Age factor
            baseCost += parseInt(formData.age) * 100;
            
            // BMI factor
            const bmi = parseFloat(formData.bmi);
            if (bmi > 30) baseCost += 10000;
            else if (bmi > 25) baseCost += 5000;
            
            // Smoker factor (biggest impact)
            if (formData.smoker === 'yes') baseCost += 20000;
            
            // Children factor
            baseCost += parseInt(formData.children) * 2000;
            
            // Regional factor
            const regionalMultipliers = {
                'northeast': 1.1,
                'northwest': 1.0,
                'southeast': 1.05,
                'southwest': 0.95
            };
            baseCost *= regionalMultipliers[formData.region] || 1.0;
            
            // Add some randomness
            baseCost += Math.floor(Math.random() * 5000) - 2500;
            
            const finalCost = Math.max(Math.floor(baseCost), 1000);
            const formattedPrediction = `$${finalCost.toLocaleString()}`;
            
            // Display result
            outputElement.textContent = formattedPrediction;
            resultContainer.classList.add('show');

            // Reset button state
            btnText.textContent = 'Dự đoán chi phí';
            spinner.style.display = 'none';
            predictBtn.disabled = false;
        }, 2000);

        // Uncomment and modify this section for your actual API call:
        /*
        fetch('/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.prediction_text) {
                outputElement.textContent = data.prediction_text;
                resultContainer.classList.add('show');
            } else if (data.error) {
                outputElement.textContent = `Error: ${data.error}`;
                outputElement.style.color = '#ef4444';
                resultContainer.classList.add('show');
            } else {
                throw new Error('Invalid response format');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            outputElement.textContent = 'Đã xảy ra lỗi. Vui lòng thử lại.';
            outputElement.style.color = '#ef4444';
            resultContainer.classList.add('show');
        })
        .finally(() => {
            // Reset button state
            btnText.textContent = 'Dự đoán chi phí';
            spinner.style.display = 'none';
            predictBtn.disabled = false;
            
            // Reset output color
            setTimeout(() => {
                outputElement.style.color = '#0c4a6e';
            }, 3000);
        });
        */
    });

    // Add input validation feedback
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            if (this.checkValidity()) {
                this.style.borderColor = '#10b981';
                this.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.1)';
            } else {
                this.style.borderColor = '#ef4444';
                this.style.boxShadow = '0 0 0 4px rgba(239, 68, 68, 0.1)';
            }
        });

        // Reset border color on blur if valid
        input.addEventListener('blur', function() {
            if (this.checkValidity()) {
                this.style.borderColor = '#e5e7eb';
                this.style.boxShadow = 'none';
            }
        });
    });

    // Add BMI calculation helper
    const bmiInput = document.getElementById('bmi');
    const ageInput = document.getElementById('age');
    
    // BMI tooltip functionality
    bmiInput.addEventListener('focus', function() {
        showBMITooltip();
    });
    
    bmiInput.addEventListener('blur', function() {
        hideBMITooltip();
    });

    // function showBMITooltip() {
    //     const tooltip = document.createElement('div');
    //     tooltip.id = 'bmi-tooltip';
        
    //     const tooltipContent = document.createElement('div');
    //     tooltipContent.className = 'bmi-tooltip-content';
    //     tooltipContent.innerHTML = `
    //         <strong>BMI Guide:</strong><br>
    //         Underweight: &lt; 18.5 | Normal: 18.5-24.9 | Overweight: 25-29.9 | Obese: ≥ 30
    //     `;
        
    //     tooltip.appendChild(tooltipContent);
    //     bmiInput.parentNode.style.position = 'relative';
    //     bmiInput.parentNode.appendChild(tooltip);
    // }

    function hideBMITooltip() {
        const tooltip = document.getElementById('bmi-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }

    // Form auto-save to localStorage (for user convenience)
    const formInputs = document.querySelectorAll('#prediction-form input, #prediction-form select');
    
    // Load saved data on page load
    formInputs.forEach(input => {
        const savedValue = localStorage.getItem(`medical-cost-${input.id}`);
        if (savedValue && savedValue !== input.value) {
            input.value = savedValue;
        }
    });

    // Save data on input change
    formInputs.forEach(input => {
        input.addEventListener('change', function() {
            localStorage.setItem(`medical-cost-${this.id}`, this.value);
        });
    });

    // Add keyboard shortcuts
    document.addEventListener('keydown', function(event) {
        // Ctrl/Cmd + Enter to submit form
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            event.preventDefault();
            if (!predictBtn.disabled) {
                form.dispatchEvent(new Event('submit'));
            }
        }
        
        // ESC to clear form
        if (event.key === 'Escape') {
            if (confirm('Bạn có muốn xóa tất cả dữ liệu đã nhập không?')) {
                form.reset();
                formInputs.forEach(input => {
                    localStorage.removeItem(`medical-cost-${input.id}`);
                    input.style.borderColor = '#e5e7eb';
                    input.style.boxShadow = 'none';
                });
                resultContainer.classList.remove('show');
                outputElement.textContent = '---';
            }
        }
    });

    // Add form validation messages
    const validateForm = () => {
        let isValid = true;
        const age = parseInt(document.getElementById('age').value);
        const bmi = parseFloat(document.getElementById('bmi').value);
        
        // Age validation
        if (age < 18 || age > 100) {
            showValidationMessage('age', 'Tuổi phải từ 18 đến 100');
            isValid = false;
        }
        
        // BMI validation
        if (bmi < 10 || bmi > 50) {
            showValidationMessage('bmi', 'BMI phải từ 10 đến 50');
            isValid = false;
        }
        
        return isValid;
    };

    const showValidationMessage = (inputId, message) => {
        const input = document.getElementById(inputId);
        const existingMessage = input.parentNode.querySelector('.validation-message');
        
        if (existingMessage) {
            existingMessage.remove();
        }
        
        const messageEl = document.createElement('div');
        messageEl.className = 'validation-message';
        messageEl.style.cssText = 'color: #ef4444; font-size: 0.8rem; margin-top: 4px;';
        messageEl.textContent = message;
        
        input.parentNode.appendChild(messageEl);
        
        setTimeout(() => {
            messageEl.remove();
        }, 3000);
    };

    // Enhanced form submission with validation
    form.addEventListener('submit', function(event) {
        if (!validateForm()) {
            event.preventDefault();
            return;
        }
    });
});