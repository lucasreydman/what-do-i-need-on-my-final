document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const courseName = document.getElementById('courseName');
    const courseNameDisplay = document.getElementById('courseNameDisplay');
    const finalExamWeight = document.getElementById('finalExamWeight');
    const finalExamGrade = document.getElementById('finalExamGrade');
    const assessmentName = document.getElementById('assessmentName');
    const customAssessmentName = document.getElementById('customAssessmentName');
    const customInputGroup = document.getElementById('customInputGroup');
    const assessmentWeight = document.getElementById('assessmentWeight');
    const assessmentGrade = document.getElementById('assessmentGrade');
    const addAssessmentBtn = document.getElementById('addAssessment');
    const assessmentsList = document.getElementById('assessmentsList');
    const totalWeightElement = document.getElementById('totalWeight');
    const weightedSumElement = document.getElementById('weightedSum');
    const finalGradeElement = document.getElementById('finalGrade');
    const letterGradeElement = document.getElementById('letterGrade');
    const gradePointElement = document.getElementById('gradePoint');
    const gradeMessage = document.getElementById('gradeMessage');
    const weightWarning = document.getElementById('weightWarning');
    const submitStepOneBtn = document.getElementById('submitStepOne');
    const finalExamForm = document.querySelector('.final-exam-form');
    const resetBtn = document.getElementById('resetCalculator');
    
    // Section elements for collapsing/expanding
    const assessmentForm = document.querySelector('.assessment-form');
    const gradeDisplay = document.querySelector('.grade-display');
    
    // App state variables
    let isStepOneSubmitted = false;
    let assessments = [];
    let isEditingMode = false;
    let isInitialLoad = true; // Flag to track initial page load
    let finalExamWeightValue = 0;
    let finalExamGradeValue = 0;
    
    // Set course name as required
    courseName.setAttribute('required', 'true');
    
    // Hide course name display initially
    courseNameDisplay.style.display = 'none';
    
    // We need to scroll back to top immediately to prevent auto-scrolling
    window.scrollTo(0, 0);
    
    // Initialize app without any auto-scrolling
    loadFromLocalStorage();
    updateSelectPlaceholderStyle(assessmentName);
    updateAddAssessmentButton();
    
    // After initial setup, set the flag to false and scroll to top again
    setTimeout(() => {
        isInitialLoad = false;
        window.scrollTo(0, 0);
    }, 100);
    
    // Event listeners
    resetBtn.addEventListener('click', resetCalculator);
    
    // Make sure we start at the top of the page when the page loads
    window.addEventListener('load', function() {
        window.scrollTo(0, 0);
    });
    
    submitStepOneBtn.addEventListener('click', function() {
        if (isStepOneSubmitted) {
            // Switch to edit mode
            toggleStepOneEditMode(false);
        } else {
            // Try to submit
            if (validateRequiredFields()) {
                toggleStepOneEditMode(true);
                
                // Only when submitting should we calculate and update displays
                calculateFinalGrade();
                updateCourseNameDisplay();
                saveToLocalStorage();
            }
        }
    });
    
    // Handle course name changes
    courseName.addEventListener('input', updateCourseNameDisplay);
    
    // Input validation for final exam weight and grade
    [finalExamWeight, finalExamGrade].forEach(input => {
        input.addEventListener('input', function() {
            // Allow empty field
            if (this.value === '') return;
            
            // Only allow numbers and one decimal point
            this.value = this.value.replace(/[^0-9.]/g, '');
            
            // Only allow one decimal point
            const decimalCount = (this.value.match(/\./g) || []).length;
            if (decimalCount > 1) {
                this.value = this.value.slice(0, this.value.lastIndexOf('.'));
            }
            
            // Limit to 2 decimal places
            const parts = this.value.split('.');
            if (parts[1] && parts[1].length > 2) {
                // Round to 2 decimal places
                const value = parseFloat(parseFloat(this.value).toFixed(2));
                this.value = value.toString();
            }
            
            // Validate the value is between 0 and 100
            const value = parseFloat(this.value);
            if (!isNaN(value) && (value < 0 || value > 100)) {
                this.value = Math.max(0, Math.min(100, value));
            }
        });
        
        // Add blur event to ensure proper formatting when user leaves the field
        input.addEventListener('blur', function() {
            if (this.value === '' || this.value === '.') {
                this.value = '';
                return;
            }
            
            // Ensure value is properly formatted with 2 decimal places when leaving the field
            const value = parseFloat(this.value);
            if (!isNaN(value)) {
                this.value = parseFloat(value.toFixed(2)).toString();
            }
        });
    });
    
    // Handle placeholder styling
    assessmentName.addEventListener('change', function() {
        updateSelectPlaceholderStyle(this);
        
        // Show/hide custom input field
        if (this.value === 'Other') {
            customInputGroup.classList.remove('hidden');
            customAssessmentName.setAttribute('required', 'true');
        } else {
            customInputGroup.classList.add('hidden');
            customAssessmentName.removeAttribute('required');
        }
    });
    
    // Input validation for weight and grade
    [assessmentWeight, assessmentGrade].forEach(input => {
        input.addEventListener('input', function() {
            // Allow empty field
            if (this.value === '') return;
            
            // Only allow numbers and one decimal point
            this.value = this.value.replace(/[^0-9.]/g, '');
            
            // Only allow one decimal point
            const decimalCount = (this.value.match(/\./g) || []).length;
            if (decimalCount > 1) {
                this.value = this.value.slice(0, this.value.lastIndexOf('.'));
            }
            
            // Limit to 2 decimal places
            const parts = this.value.split('.');
            if (parts[1] && parts[1].length > 2) {
                // Round to 2 decimal places
                const value = parseFloat(parseFloat(this.value).toFixed(2));
                this.value = value.toString();
            }
            
            // Validate the value is between 0 and 100
            const value = parseFloat(this.value);
            if (!isNaN(value) && (value < 0 || value > 100)) {
                this.value = Math.max(0, Math.min(100, value));
            }
        });
        
        // Add blur event to ensure proper formatting when user leaves the field
        input.addEventListener('blur', function() {
            if (this.value === '' || this.value === '.') {
                this.value = '';
                return;
            }
            
            // Ensure value is properly formatted with 2 decimal places when leaving the field
            const value = parseFloat(this.value);
            if (!isNaN(value)) {
                this.value = parseFloat(value.toFixed(2)).toString();
            }
        });
    });
    
    // Add assessment button
    addAssessmentBtn.addEventListener('click', function() {
        if (!isStepOneSubmitted) {
            alert('Please submit your course information first.');
            return;
        }
        
        addAssessment();
    });
    
    // Function to toggle edit mode for Step 1
    function toggleStepOneEditMode(submitted) {
        isStepOneSubmitted = submitted;
        
        if (submitted) {
            // Lock the fields
            finalExamForm.classList.add('submitted');
            courseName.disabled = true;
            finalExamWeight.disabled = true;
            finalExamGrade.disabled = true;
            
            // Change button
            submitStepOneBtn.innerHTML = '<i class="fas fa-edit"></i> Edit Info';
            submitStepOneBtn.classList.add('edit-mode');
        } else {
            // Unlock the fields
            finalExamForm.classList.remove('submitted');
            courseName.disabled = false;
            finalExamWeight.disabled = false;
            finalExamGrade.disabled = false;
            
            // Change button back
            submitStepOneBtn.innerHTML = '<i class="fas fa-check"></i> Submit Info';
            submitStepOneBtn.classList.remove('edit-mode');
        }
        
        // Update course name display based on new submission status
        updateCourseNameDisplay();
    }
    
    // Function to validate all required fields
    function validateRequiredFields() {
        if (!courseName.value.trim()) {
            alert('Please enter a course name.');
            courseName.focus();
            return false;
        }
        
        if (!finalExamWeight.value.trim()) {
            alert('Please enter the final exam weight.');
            finalExamWeight.focus();
            return false;
        }
        
        if (!finalExamGrade.value.trim()) {
            alert('Please enter your achieved grade on the final exam.');
            finalExamGrade.focus();
            return false;
        }
        
        // Parse and validate the values
        const weight = parseFloat(finalExamWeight.value);
        const grade = parseFloat(finalExamGrade.value);
        
        if (isNaN(weight) || isNaN(grade)) {
            alert('Please enter valid numbers for final exam weight and grade.');
            return false;
        }
        
        // Store the values for later use
        finalExamWeightValue = weight;
        finalExamGradeValue = grade;
        
        return true;
    }
    
    // Function to capitalize first letter of each word
    function capitalizeWords(string) {
        return string
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
    
    // Update course name display
    function updateCourseNameDisplay() {
        let displayText = courseName.value.trim();
        
        // Only show course name in results if Step 1 has been submitted
        if (!displayText || !isStepOneSubmitted) {
            courseNameDisplay.style.display = 'none';
        } else {
            // Capitalize first letter of each word
            displayText = capitalizeWords(displayText);
            
            courseNameDisplay.style.display = 'block';
            courseNameDisplay.textContent = displayText;
        }
    }
    
    // Function to update placeholder style
    function updateSelectPlaceholderStyle(selectElement) {
        if (!selectElement.value || selectElement.value === "") {
            selectElement.classList.add('placeholder-visible');
        } else {
            selectElement.classList.remove('placeholder-visible');
        }
    }
    
    function getAssessmentName(select) {
        if (select.value === 'Other') {
            return customAssessmentName.value.trim();
        }
        return select.value;
    }
    
    function addAssessment() {
        const name = getAssessmentName(assessmentName);
        const weightValue = assessmentWeight.value.trim();
        const gradeValue = assessmentGrade.value.trim();
        
        if (!name || !weightValue || !gradeValue || assessmentName.value === "") {
            alert('Please fill out all fields correctly.');
            return;
        }
        
        // Round to 2 decimal places
        const weight = parseFloat(parseFloat(weightValue).toFixed(2));
        const grade = parseFloat(parseFloat(gradeValue).toFixed(2));
        
        if (isNaN(weight) || isNaN(grade)) {
            alert('Please enter valid numbers for weight and grade.');
            return;
        }
        
        const totalCurrentWeight = calculateTotalWeight(assessments);
        const totalWithFinalExam = totalCurrentWeight + finalExamWeightValue;
        const newTotalWeight = totalWithFinalExam + weight;
        
        if (newTotalWeight > 100) {
            alert(`The assessment weight of ${weight}% is too high.\n\nYour current total weight (including final exam) is ${totalWithFinalExam}%.\nYou can only add ${(100 - totalWithFinalExam).toFixed(2)}% more weight.`);
            return;
        }
        
        const assessment = {
            name,
            weight,
            grade,
            weighted: parseFloat(((weight * grade) / 100).toFixed(2))
        };
        
        assessments.push(assessment);
        isEditingMode = false;
        renderAssessments();
        calculateFinalGrade();
        resetForm(assessmentName, assessmentWeight, assessmentGrade);
        saveToLocalStorage();
        
        // Check if we should collapse the form
        checkWeightStatusAndToggleForm();
        
        // Change button text and style after first assessment is added
        updateAddAssessmentButton();
    }
    
    // Function to update the Add Assessment button based on whether assessments exist
    function updateAddAssessmentButton() {
        if (assessments.length > 0) {
            addAssessmentBtn.innerHTML = '<i class="fas fa-plus"></i> Add Another Assessment';
            addAssessmentBtn.classList.add('another');
        } else {
            addAssessmentBtn.innerHTML = '<i class="fas fa-plus"></i> Add Assessment';
            addAssessmentBtn.classList.remove('another');
        }
    }
    
    function resetForm(nameSelect, weightInput, gradeInput) {
        nameSelect.value = "";
        weightInput.value = '';
        gradeInput.value = '';
        updateSelectPlaceholderStyle(nameSelect);
        
        // Hide custom input if it was shown
        if (customInputGroup) {
            customInputGroup.classList.add('hidden');
            customAssessmentName.value = '';
            customAssessmentName.removeAttribute('required');
        }
    }
    
    // Format number to remove trailing zeros
    function formatNumber(number) {
        // Convert to string with 2 decimal places
        const formatted = parseFloat(number).toFixed(2);
        // Remove trailing zeros and trailing decimal point if needed
        return parseFloat(formatted).toString();
    }
    
    function renderAssessments() {
        assessmentsList.innerHTML = '';
        
        assessments.forEach((assessment, index) => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${assessment.name}</td>
                <td class="percent-cell">${formatNumber(assessment.weight)}</td>
                <td class="percent-cell">${formatNumber(assessment.grade)}</td>
                <td class="percent-cell">${formatNumber(assessment.weighted)}</td>
                <td class="actions-column">
                    <div class="actions-cell">
                        <button class="edit-btn" data-index="${index}"><i class="fas fa-pencil-alt"></i></button>
                        <button class="delete-btn" data-index="${index}"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </td>
            `;
            
            assessmentsList.appendChild(row);
        });
        
        // Update the Add Assessment button text and style
        updateAddAssessmentButton();
        
        // Add event listeners to delete buttons
        document.querySelectorAll('#assessmentsList .delete-btn').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                assessments.splice(index, 1);
                renderAssessments();
                calculateFinalGrade();
                saveToLocalStorage();
                
                // Re-evaluate form state
                checkWeightStatusAndToggleForm();
            });
        });
        
        // Add event listeners to edit buttons
        document.querySelectorAll('#assessmentsList .edit-btn').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                editAssessment(index);
            });
        });
    }
    
    function editAssessment(index) {
        const assessment = assessments[index];
        
        // Set editing mode flag
        isEditingMode = true;
        
        // Expand form if collapsed
        toggleAssessmentForm(false);
        
        // Populate form with assessment data
        assessmentName.value = assessment.name;
        updateSelectPlaceholderStyle(assessmentName);
        
        // Check if it's a custom assessment
        if (!Array.from(assessmentName.options).some(option => option.value === assessment.name)) {
            assessmentName.value = 'Other';
            customInputGroup.classList.remove('hidden');
            customAssessmentName.value = assessment.name;
            customAssessmentName.setAttribute('required', 'true');
        } else {
            customInputGroup.classList.add('hidden');
            customAssessmentName.value = '';
            customAssessmentName.removeAttribute('required');
        }
        
        assessmentWeight.value = assessment.weight;
        assessmentGrade.value = assessment.grade;
        
        // Remove the assessment from the array
        assessments.splice(index, 1);
        
        // Scroll to the form and focus on the first field only if not during initial load
        if (!isInitialLoad) {
            assessmentForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        
        // Update UI
        renderAssessments();
        calculateFinalGrade();
        saveToLocalStorage();
    }
    
    function calculateTotalWeight(assessmentArray) {
        return assessmentArray.reduce((sum, assessment) => sum + assessment.weight, 0);
    }
    
    function calculateWeightedSum(assessmentArray) {
        return assessmentArray.reduce((sum, assessment) => sum + assessment.weighted, 0);
    }
    
    function calculateFinalGrade() {
        const totalCurrentWeight = parseFloat(calculateTotalWeight(assessments).toFixed(2));
        const currentWeightedSum = parseFloat(calculateWeightedSum(assessments).toFixed(2));
        
        // Add final exam to the calculation if it's been submitted
        let finalExamWeighted = 0;
        if (isStepOneSubmitted && finalExamWeightValue > 0) {
            finalExamWeighted = parseFloat(((finalExamWeightValue * finalExamGradeValue) / 100).toFixed(2));
        }
        
        // Calculate total weight including final exam
        const totalWeight = totalCurrentWeight + finalExamWeightValue;
        
        totalWeightElement.textContent = formatNumber(totalWeight);
        
        // Calculate weighted sum including final exam
        const weightedSum = currentWeightedSum + finalExamWeighted;
        weightedSumElement.textContent = formatNumber(weightedSum);
        
        // Check if assessments weight = 100%
        if (totalWeight !== 100) {
            const difference = 100 - totalWeight;
            let warningMessage = '';
            
            if (difference > 0) {
                warningMessage = `<i class="fas fa-exclamation-triangle"></i> Your current total weight is <strong>${formatNumber(totalWeight)}%</strong> but should equal <strong>100%</strong>. You need to add <strong>${formatNumber(difference)}%</strong> more weight.`;
                // Enable the add button when under 100%
                addAssessmentBtn.disabled = false;
                addAssessmentBtn.classList.remove('disabled');
            } else {
                warningMessage = `<i class="fas fa-exclamation-triangle"></i> Your current total weight is <strong>${formatNumber(totalWeight)}%</strong> but should equal <strong>100%</strong>. You need to remove <strong>${formatNumber(Math.abs(difference))}%</strong> weight.`;
                // Only disable the add button when over 100%
                addAssessmentBtn.disabled = true;
                addAssessmentBtn.classList.add('disabled');
            }
            
            weightWarning.innerHTML = warningMessage;
            weightWarning.style.display = 'block';
            
            // Show message
            gradeMessage.textContent = 'Please ensure your total weight equals 100% to see your final grade.';
            finalGradeElement.textContent = '0';
            letterGradeElement.textContent = 'N/A';
            gradePointElement.textContent = '0.00';
        } else {
            weightWarning.style.display = 'none';
            
            // Enable calculation button
            addAssessmentBtn.disabled = false;
            addAssessmentBtn.classList.remove('disabled');
            
            // Calculate final grade
            const finalGrade = weightedSum;
            finalGradeElement.textContent = formatNumber(finalGrade);
            
            // Determine letter grade and grade point
            const { letterGrade, gradePoint } = getLetterGrade(finalGrade);
            letterGradeElement.textContent = letterGrade;
            gradePointElement.textContent = gradePoint.toFixed(2);
            
            // Clear message
            gradeMessage.textContent = '';
            
            // Animate the result box into view
            gradeDisplay.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
    
    function getLetterGrade(numericGrade) {
        if (numericGrade >= 90) {
            return { letterGrade: 'A+', gradePoint: 4.30 };
        } else if (numericGrade >= 85) {
            return { letterGrade: 'A', gradePoint: 4.00 };
        } else if (numericGrade >= 80) {
            return { letterGrade: 'A-', gradePoint: 3.70 };
        } else if (numericGrade >= 77) {
            return { letterGrade: 'B+', gradePoint: 3.30 };
        } else if (numericGrade >= 73) {
            return { letterGrade: 'B', gradePoint: 3.00 };
        } else if (numericGrade >= 70) {
            return { letterGrade: 'B-', gradePoint: 2.70 };
        } else if (numericGrade >= 65) {
            return { letterGrade: 'C+', gradePoint: 2.30 };
        } else if (numericGrade >= 60) {
            return { letterGrade: 'C', gradePoint: 2.00 };
        } else if (numericGrade >= 55) {
            return { letterGrade: 'C-', gradePoint: 1.70 };
        } else if (numericGrade >= 50) {
            return { letterGrade: 'D', gradePoint: 1.00 };
        } else {
            return { letterGrade: 'F', gradePoint: 0.00 };
        }
    }
    
    // Function to toggle assessment form - private function, not triggered by user clicks
    function toggleAssessmentForm(shouldCollapse) {
        // During initial load, just modify classes without scrolling
        if (isInitialLoad) {
            if (shouldCollapse) {
                assessmentForm.classList.add('collapsed');
            } else {
                assessmentForm.classList.remove('collapsed');
            }
            return;
        }
        
        // After initial load, normal behavior
        if (shouldCollapse) {
            // Collapse
            assessmentForm.classList.add('collapsed');
            
            // Scroll to results if not in editing mode
            if (!isEditingMode) {
                gradeDisplay.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } else {
            // Expand
            assessmentForm.classList.remove('collapsed');
            
            // Scroll to the form
            assessmentForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
    
    // Check if weight is achieved and toggle form accordingly
    function checkWeightStatusAndToggleForm() {
        const totalCurrentWeight = parseFloat(calculateTotalWeight(assessments).toFixed(2));
        const totalWeight = totalCurrentWeight + finalExamWeightValue;
        
        // If weight is achieved and we have assessments and not in editing mode, collapse the form
        if (totalWeight === 100 && (assessments.length > 0 || finalExamWeightValue > 0) && !isEditingMode) {
            toggleAssessmentForm(true);
        } else {
            toggleAssessmentForm(false);
        }
    }
    
    // Save calculator state to local storage
    function saveToLocalStorage() {
        // Store the capitalized version of the course name if it exists
        const courseNameToSave = courseName.value.trim() ? capitalizeWords(courseName.value.trim()) : courseName.value;
        
        const calculatorState = {
            courseName: courseNameToSave,
            finalExamWeight: finalExamWeightValue,
            finalExamGrade: finalExamGradeValue,
            assessments: assessments,
            isFormCollapsed: assessmentForm.classList.contains('collapsed')
        };
        
        localStorage.setItem('finalGradeCalculatorState', JSON.stringify(calculatorState));
    }
    
    // Load calculator state from local storage
    function loadFromLocalStorage() {
        const savedState = localStorage.getItem('finalGradeCalculatorState');
        
        if (savedState) {
            try {
                const calculatorState = JSON.parse(savedState);
                
                // Restore input values
                courseName.value = calculatorState.courseName || '';
                finalExamWeight.value = calculatorState.finalExamWeight || '';
                finalExamGrade.value = calculatorState.finalExamGrade || '';
                
                // Store the values for calculations
                finalExamWeightValue = calculatorState.finalExamWeight || 0;
                finalExamGradeValue = calculatorState.finalExamGrade || 0;
                
                // Update displays
                updateCourseNameDisplay();
                
                // Restore assessments
                if (calculatorState.assessments && Array.isArray(calculatorState.assessments)) {
                    assessments = calculatorState.assessments;
                    renderAssessments();
                }
                
                // Determine if Step 1 was already submitted
                const hasSubmittedData = courseName.value.trim() && finalExamWeight.value.trim() && finalExamGrade.value.trim();
                
                if (hasSubmittedData) {
                    // Set as submitted if we have all required data
                    isStepOneSubmitted = true;
                    
                    // Apply submitted state to UI without scrolling
                    finalExamForm.classList.add('submitted');
                    courseName.disabled = true;
                    finalExamWeight.disabled = true;
                    finalExamGrade.disabled = true;
                    submitStepOneBtn.innerHTML = '<i class="fas fa-edit"></i> Edit Info';
                    submitStepOneBtn.classList.add('edit-mode');
                    
                    // Update displays
                    updateCourseNameDisplay();
                    calculateFinalGrade();
                    
                    // Set form state directly based on weight criteria without scrolling
                    const totalCurrentWeight = parseFloat(calculateTotalWeight(assessments).toFixed(2));
                    const totalWeight = totalCurrentWeight + finalExamWeightValue;
                    
                    if (totalWeight === 100 && (assessments.length > 0 || finalExamWeightValue > 0)) {
                        // Just toggle the class without scrolling
                        assessmentForm.classList.add('collapsed');
                    } else {
                        assessmentForm.classList.remove('collapsed');
                    }
                } else {
                    // Not submitted yet
                    isStepOneSubmitted = false;
                    assessmentForm.classList.remove('collapsed');
                }
                
            } catch (error) {
                console.error('Error loading saved data:', error);
                // If there's an error, clear local storage
                localStorage.removeItem('finalGradeCalculatorState');
            }
        }
        
        // Force a scroll to top to ensure we start at the beginning
        window.scrollTo(0, 0);
    }
    
    // Reset calculator function
    function resetCalculator() {
        // Confirm reset
        if (confirm('Are you sure you want to reset the calculator? This will clear all your data.')) {
            // Clear localStorage
            localStorage.removeItem('finalGradeCalculatorState');
            
            // Reset all inputs and assessments
            courseName.value = '';
            finalExamWeight.value = '';
            finalExamGrade.value = '';
            assessmentName.value = '';
            assessmentWeight.value = '';
            assessmentGrade.value = '';
            
            // Reset stored values
            finalExamWeightValue = 0;
            finalExamGradeValue = 0;
            
            if (customInputGroup) {
                customInputGroup.classList.add('hidden');
                customAssessmentName.value = '';
                customAssessmentName.removeAttribute('required');
            }
            
            // Clear assessments array and render
            assessments = [];
            renderAssessments();
            
            // Reset all displays
            totalWeightElement.textContent = '0';
            weightedSumElement.textContent = '0';
            finalGradeElement.textContent = '0';
            letterGradeElement.textContent = 'N/A';
            gradePointElement.textContent = '0.00';
            gradeMessage.textContent = 'Please add assessments to calculate your final grade.';
            courseNameDisplay.style.display = 'none';
            courseNameDisplay.textContent = 'Course Name';
            
            // Reset form state
            toggleStepOneEditMode(false);
            
            // Toggle assessment form to default state
            toggleAssessmentForm(false);
            
            // Clear warning message
            weightWarning.innerHTML = '';
            weightWarning.style.display = 'none';
            
            // Enable edits to fields
            courseName.disabled = false;
            finalExamWeight.disabled = false;
            finalExamGrade.disabled = false;
            
            // Update button state
            updateAddAssessmentButton();
        }
    }
}); 