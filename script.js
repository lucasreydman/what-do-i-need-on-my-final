document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements - Final Exam Mode
    const courseName = document.getElementById('courseName');
    const courseNameDisplay = document.getElementById('courseNameDisplay');
    const finalExamWeight = document.getElementById('finalExamWeight');
    const targetGrade = document.getElementById('targetGrade');
    const finalAssessmentName = document.getElementById('finalAssessmentName');
    const finalCustomAssessment = document.getElementById('finalCustomAssessment');
    const finalAssessmentWeight = document.getElementById('finalAssessmentWeight');
    const finalAssessmentGrade = document.getElementById('finalAssessmentGrade');
    const addFinalAssessmentBtn = document.getElementById('addFinalAssessment');
    const finalAssessmentsList = document.getElementById('finalAssessmentsList');
    const finalTotalWeightElement = document.getElementById('finalTotalWeight');
    const finalCurrentGradeElement = document.getElementById('finalCurrentGrade');
    const neededGradeElement = document.getElementById('neededGrade');
    const neededGradeMessage = document.getElementById('neededGradeMessage');
    const finalWeightWarning = document.getElementById('finalWeightWarning');
    const bestPossibleGrade = document.getElementById('bestPossibleGrade');
    const maxPossibleGrade = document.getElementById('maxPossibleGrade');
    const displayFinalExamWeight = document.getElementById('displayFinalExamWeight');
    const displayTargetGrade = document.getElementById('displayTargetGrade');
    const submitStepOneBtn = document.getElementById('submitStepOne');
    const finalExamForm = document.querySelector('.final-exam-form');
    const resetBtn = document.getElementById('resetCalculator');
    
    // Section elements for collapsing/expanding
    const assessmentForm = document.querySelector('.assessment-form');
    const gradeDisplay = document.querySelector('.grade-display');
    
    // App state variables
    let isStepOneSubmitted = false;
    let finalAssessments = [];
    let isEditingMode = false;
    let isInitialLoad = true; // Flag to track initial page load
    
    // Set course name as required
    courseName.setAttribute('required', 'true');
    
    // Hide course name display initially
    courseNameDisplay.style.display = 'none';
    
    // We need to scroll back to top immediately to prevent auto-scrolling
    window.scrollTo(0, 0);
    
    // Initialize app without any auto-scrolling
    loadFromLocalStorage();
    updateSelectPlaceholderStyle(finalAssessmentName);
    updateAddAssessmentButton();
    
    // Replace the immediate call to checkWeightStatusAndToggleForm
    // with a non-scrolling version for initial load
    if (isStepOneSubmitted) {
        const examWeightValue = finalExamWeight.value.trim();
        const examWeight = parseFloat(examWeightValue) || 0;
        const totalCurrentWeight = calculateTotalWeight(finalAssessments);
        const expectedAssessmentWeight = 100 - examWeight;
        
        if (totalCurrentWeight === expectedAssessmentWeight && finalAssessments.length > 0) {
            // Just add the collapsed class without scrolling
            assessmentForm.classList.add('collapsed');
        } else {
            assessmentForm.classList.remove('collapsed');
        }
    }
    
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
                calculateNeededGrade();
                updateExamInfoDisplay();
                checkWeightStatusAndToggleForm();
                saveToLocalStorage();
            }
        }
    });
    
    // Handle course name changes
    courseName.addEventListener('input', updateCourseNameDisplay);
    
    // Handle custom assessment name input and placeholder styling
    finalAssessmentName.addEventListener('change', function() {
        if (this.value === 'custom') {
            finalCustomAssessment.classList.remove('hidden');
        } else {
            finalCustomAssessment.classList.add('hidden');
        }
        updateSelectPlaceholderStyle(this);
    });
    
    // Input validation for weight and grade
    [finalAssessmentWeight, finalAssessmentGrade, finalExamWeight, targetGrade].forEach(input => {
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
    addFinalAssessmentBtn.addEventListener('click', function() {
        if (!isStepOneSubmitted) {
            alert('Please submit your course information first.');
            return;
        }
        
        addFinalAssessment();
    });
    
    // Function to toggle edit mode for Step 1
    function toggleStepOneEditMode(submitted) {
        isStepOneSubmitted = submitted;
        
        if (submitted) {
            // Lock the fields
            finalExamForm.classList.add('submitted');
            courseName.disabled = true;
            finalExamWeight.disabled = true;
            targetGrade.disabled = true;
            
            // Change button
            submitStepOneBtn.innerHTML = '<i class="fas fa-edit"></i> Edit Info';
            submitStepOneBtn.classList.add('edit-mode');
        } else {
            // Unlock the fields
            finalExamForm.classList.remove('submitted');
            courseName.disabled = false;
            finalExamWeight.disabled = false;
            targetGrade.disabled = false;
            
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
        
        if (!finalExamWeight.value) {
            alert('Please enter your final exam weight.');
            finalExamWeight.focus();
            return false;
        }
        
        if (!targetGrade.value) {
            alert('Please enter your target grade.');
            targetGrade.focus();
            return false;
        }
        
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
        const examWeightValue = finalExamWeight.value.trim();
        const examWeight = parseFloat(parseFloat(examWeightValue || 0).toFixed(2));
        if (!examWeight) return;
        
        const totalCurrentWeight = parseFloat(calculateTotalWeight(finalAssessments).toFixed(2));
        const expectedAssessmentWeight = parseFloat((100 - examWeight).toFixed(2));
        
        // If weight is achieved and we have assessments and not in editing mode, collapse the form
        if (totalCurrentWeight === expectedAssessmentWeight && finalAssessments.length > 0 && !isEditingMode) {
            toggleAssessmentForm(true);
        } else {
            toggleAssessmentForm(false);
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
    
    function getAssessmentName(select, customInput) {
        return select.value === 'custom' ? customInput.value.trim() : select.value;
    }
    
    function addFinalAssessment() {
        const name = getAssessmentName(finalAssessmentName, finalCustomAssessment);
        const weightValue = finalAssessmentWeight.value.trim();
        const gradeValue = finalAssessmentGrade.value.trim();
        
        if (!name || !weightValue || !gradeValue || finalAssessmentName.value === "") {
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
        
        const examWeightValue = finalExamWeight.value.trim();
        const examWeight = parseFloat(examWeightValue) || 0;
        const totalCurrentWeight = calculateTotalWeight(finalAssessments);
        const expectedAssessmentWeight = 100 - examWeight;
        const remainingWeight = expectedAssessmentWeight - totalCurrentWeight;
        
        if (totalCurrentWeight + weight > expectedAssessmentWeight) {
            alert(`The assessment weight of ${weight}% is too high.\n\nYour current assessments total ${totalCurrentWeight}%.\nWith final exam weight of ${examWeight}%, you can only add ${remainingWeight}% more weight.`);
            return;
        }
        
        const assessment = {
            name,
            weight,
            grade,
            weighted: parseFloat(((weight * grade) / 100).toFixed(2))
        };
        
        finalAssessments.push(assessment);
        isEditingMode = false;
        renderFinalAssessments();
        calculateNeededGrade();
        resetForm(finalAssessmentName, finalCustomAssessment, finalAssessmentWeight, finalAssessmentGrade);
        saveToLocalStorage();
        
        // Check if we should collapse the form
        checkWeightStatusAndToggleForm();
        
        // Change button text and style after first assessment is added
        updateAddAssessmentButton();
    }
    
    // Function to update the Add Assessment button based on whether assessments exist
    function updateAddAssessmentButton() {
        if (finalAssessments.length > 0) {
            addFinalAssessmentBtn.innerHTML = '<i class="fas fa-plus"></i> Add Another Assessment';
            addFinalAssessmentBtn.classList.add('another');
        } else {
            addFinalAssessmentBtn.innerHTML = '<i class="fas fa-plus"></i> Add Assessment';
            addFinalAssessmentBtn.classList.remove('another');
        }
    }
    
    function resetForm(nameSelect, customInput, weightInput, gradeInput) {
        nameSelect.value = "";
        customInput.value = '';
        customInput.classList.add('hidden');
        weightInput.value = '';
        gradeInput.value = '';
        updateSelectPlaceholderStyle(nameSelect);
    }
    
    function renderFinalAssessments() {
        finalAssessmentsList.innerHTML = '';
        
        finalAssessments.forEach((assessment, index) => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${assessment.name}</td>
                <td class="percent-cell">${assessment.weight.toFixed(2)}</td>
                <td class="percent-cell">${assessment.grade.toFixed(2)}</td>
                <td class="percent-cell">${assessment.weighted.toFixed(2)}</td>
                <td class="actions-cell">
                    <button class="edit-btn mobile-btn" data-index="${index}"><i class="fas fa-edit"></i> <span class="btn-text">Edit</span></button>
                    <button class="delete-btn mobile-btn" data-index="${index}"><i class="fas fa-trash"></i> <span class="btn-text">Delete</span></button>
                </td>
            `;
            
            finalAssessmentsList.appendChild(row);
        });
        
        // Update the Add Assessment button text and style
        updateAddAssessmentButton();
        
        // Add event listeners to delete buttons
        document.querySelectorAll('#finalAssessmentsList .delete-btn').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                finalAssessments.splice(index, 1);
                renderFinalAssessments();
                calculateNeededGrade();
                saveToLocalStorage();
                
                // Re-evaluate form state
                checkWeightStatusAndToggleForm();
            });
        });
        
        // Add event listeners to edit buttons
        document.querySelectorAll('#finalAssessmentsList .edit-btn').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                editAssessment(index);
            });
        });
    }
    
    function editAssessment(index) {
        const assessment = finalAssessments[index];
        
        // Set editing mode flag
        isEditingMode = true;
        
        // Expand form if collapsed
        toggleAssessmentForm(false);
        
        // Populate form with assessment data
        if (assessment.name === 'Test' || assessment.name === 'Midterm Exam' || 
            assessment.name === 'Quiz' || assessment.name === 'Lab' || 
            assessment.name === 'Project' || assessment.name === 'Assignment' || 
            assessment.name === 'Essay') {
            finalAssessmentName.value = assessment.name;
            finalCustomAssessment.classList.add('hidden');
        } else {
            finalAssessmentName.value = 'custom';
            finalCustomAssessment.value = assessment.name;
            finalCustomAssessment.classList.remove('hidden');
        }
        
        updateSelectPlaceholderStyle(finalAssessmentName);
        finalAssessmentWeight.value = assessment.weight;
        finalAssessmentGrade.value = assessment.grade;
        
        // Remove the assessment from the array
        finalAssessments.splice(index, 1);
        
        // Scroll to the form and focus on the first field only if not during initial load
        if (!isInitialLoad) {
            assessmentForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        
        // Update UI
        renderFinalAssessments();
        calculateNeededGrade();
        saveToLocalStorage();
    }
    
    function calculateTotalWeight(assessmentArray) {
        return assessmentArray.reduce((sum, assessment) => sum + assessment.weight, 0);
    }
    
    function calculateWeightedSum(assessmentArray) {
        return assessmentArray.reduce((sum, assessment) => sum + assessment.weighted, 0);
    }
    
    function calculateNeededGrade() {
        const examWeightValue = finalExamWeight.value.trim();
        const targetGradeValue = targetGrade.value.trim();
        
        // Round to 2 decimal places
        const examWeight = parseFloat(parseFloat(examWeightValue || 0).toFixed(2));
        const desiredGrade = parseFloat(parseFloat(targetGradeValue || 0).toFixed(2));
        const totalCurrentWeight = parseFloat(calculateTotalWeight(finalAssessments).toFixed(2));
        const currentWeightedSum = parseFloat(calculateWeightedSum(finalAssessments).toFixed(2));
        
        finalTotalWeightElement.textContent = totalCurrentWeight.toFixed(2);
        bestPossibleGrade.classList.add('hidden');
        
        // Update the exam info display
        updateExamInfoDisplay();
        
        // Validate inputs
        if (examWeight === 0 || desiredGrade === 0) {
            neededGradeElement.textContent = '0.00';
            neededGradeMessage.textContent = 'Please enter your final exam weight and target grade.';
            return;
        }
        
        // Check if assessments weight + final exam weight = 100%
        const totalWeight = totalCurrentWeight + examWeight;
        const expectedAssessmentWeight = 100 - examWeight;
        
        // Show warning if current assessment weights don't equal expected value
        if (isStepOneSubmitted && totalCurrentWeight !== expectedAssessmentWeight) {
            const difference = expectedAssessmentWeight - totalCurrentWeight;
            let warningMessage = '';
            
            if (difference > 0) {
                warningMessage = `<i class="fas fa-exclamation-triangle"></i> Your current total weight is <strong>${totalCurrentWeight}%</strong> but should equal <strong>${expectedAssessmentWeight}%</strong>. You need to add <strong>${difference}%</strong> more weight.`;
            } else {
                warningMessage = `<i class="fas fa-exclamation-triangle"></i> Your current total weight is <strong>${totalCurrentWeight}%</strong> but should equal <strong>${expectedAssessmentWeight}%</strong>. You need to remove <strong>${Math.abs(difference)}%</strong> weight.`;
            }
            
            finalWeightWarning.innerHTML = warningMessage;
            finalWeightWarning.style.display = 'block';
        } else {
            finalWeightWarning.style.display = 'none';
        }
        
        if (totalCurrentWeight === 0) {
            finalCurrentGradeElement.textContent = '0.00';
        } else {
            // Calculate current grade based on existing assessments
            const currentGrade = currentWeightedSum / (totalCurrentWeight / 100);
            finalCurrentGradeElement.textContent = currentGrade.toFixed(2);
        }
        
        // Calculate needed grade
        const pointsNeeded = parseFloat(((desiredGrade * totalWeight / 100) - currentWeightedSum).toFixed(2));
        let neededGrade = parseFloat(((pointsNeeded / examWeight) * 100).toFixed(2));
        
        if (neededGrade < 0) {
            neededGradeElement.textContent = '0.00';
            neededGradeMessage.textContent = 'You have already achieved your target grade!';
        } else if (neededGrade > 100) {
            neededGradeElement.textContent = 'Impossible';
            neededGradeMessage.textContent = 'You cannot achieve your target grade with the current assessments.';
            
            // Calculate best possible grade (assuming 100% on final)
            const maxPoints = currentWeightedSum + examWeight; // 100% on final
            const maxGrade = maxPoints / (totalWeight / 100);
            maxPossibleGrade.textContent = maxGrade.toFixed(2);
            bestPossibleGrade.classList.remove('hidden');
        } else {
            neededGradeElement.textContent = neededGrade.toFixed(2);
            neededGradeMessage.textContent = '';
        }
    }
    
    // Update the exam info display
    function updateExamInfoDisplay() {
        const examWeightValue = finalExamWeight.value.trim();
        const targetGradeValue = targetGrade.value.trim();
        
        // Format with 2 decimal places
        if (examWeightValue) {
            const value = parseFloat(examWeightValue);
            displayFinalExamWeight.textContent = value.toFixed(2);
        } else {
            displayFinalExamWeight.textContent = '0.00';
        }
        
        if (targetGradeValue) {
            const value = parseFloat(targetGradeValue);
            displayTargetGrade.textContent = value.toFixed(2);
        } else {
            displayTargetGrade.textContent = '0.00';
        }
    }
    
    // Save calculator state to local storage
    function saveToLocalStorage() {
        // Store the capitalized version of the course name if it exists
        const courseNameToSave = courseName.value.trim() ? capitalizeWords(courseName.value.trim()) : courseName.value;
        
        const calculatorState = {
            courseName: courseNameToSave,
            finalExamWeight: finalExamWeight.value,
            targetGrade: targetGrade.value,
            assessments: finalAssessments,
            isFormCollapsed: assessmentForm.classList.contains('collapsed')
        };
        
        localStorage.setItem('gradeCalculatorState', JSON.stringify(calculatorState));
    }
    
    // Load calculator state from local storage
    function loadFromLocalStorage() {
        const savedState = localStorage.getItem('gradeCalculatorState');
        
        if (savedState) {
            try {
                const calculatorState = JSON.parse(savedState);
                
                // Restore input values
                courseName.value = calculatorState.courseName || '';
                finalExamWeight.value = calculatorState.finalExamWeight || '';
                targetGrade.value = calculatorState.targetGrade || '';
                
                // Update displays
                updateCourseNameDisplay();
                
                // Restore assessments
                if (calculatorState.assessments && Array.isArray(calculatorState.assessments)) {
                    finalAssessments = calculatorState.assessments;
                    renderFinalAssessments();
                }
                
                // Determine if Step 1 was already submitted
                const hasSubmittedData = courseName.value.trim() && 
                                        finalExamWeight.value && 
                                        targetGrade.value;
                
                if (hasSubmittedData) {
                    // Set as submitted if we have all required data
                    isStepOneSubmitted = true;
                    
                    // Apply submitted state to UI without scrolling
                    finalExamForm.classList.add('submitted');
                    courseName.disabled = true;
                    finalExamWeight.disabled = true;
                    targetGrade.disabled = true;
                    submitStepOneBtn.innerHTML = '<i class="fas fa-edit"></i> Edit Info';
                    submitStepOneBtn.classList.add('edit-mode');
                    
                    // Update displays
                    updateCourseNameDisplay();
                    updateExamInfoDisplay();
                    calculateNeededGrade();
                    
                    // Set form state directly based on weight criteria without scrolling
                    const examWeightValue = finalExamWeight.value.trim();
                    const examWeight = parseFloat(parseFloat(examWeightValue || 0).toFixed(2));
                    const totalCurrentWeight = parseFloat(calculateTotalWeight(finalAssessments).toFixed(2));
                    const expectedAssessmentWeight = parseFloat((100 - examWeight).toFixed(2));
                    
                    if (totalCurrentWeight === expectedAssessmentWeight && finalAssessments.length > 0) {
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
                localStorage.removeItem('gradeCalculatorState');
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
            localStorage.removeItem('gradeCalculatorState');
            
            // Reset all inputs and assessments
            courseName.value = '';
            finalExamWeight.value = '';
            targetGrade.value = '';
            finalAssessmentName.value = '';
            finalCustomAssessment.value = '';
            finalAssessmentWeight.value = '';
            finalAssessmentGrade.value = '';
            
            // Clear assessments array and render
            finalAssessments = [];
            renderFinalAssessments();
            
            // Reset all displays
            finalTotalWeightElement.textContent = '0.00';
            finalCurrentGradeElement.textContent = '0.00';
            neededGradeElement.textContent = '0.00';
            neededGradeMessage.textContent = 'Enter your assessments and target grade to calculate.';
            displayFinalExamWeight.textContent = '0.00';
            displayTargetGrade.textContent = '0.00';
            courseNameDisplay.style.display = 'none';
            courseNameDisplay.textContent = 'Course Name';
            bestPossibleGrade.classList.add('hidden');
            
            // Reset form state
            toggleStepOneEditMode(false);
            
            // Toggle assessment form to default state
            toggleAssessmentForm(false);
            
            // Clear warning message
            finalWeightWarning.innerHTML = '';
            finalWeightWarning.style.display = 'none';
            
            // Enable edits to fields
            courseName.disabled = false;
            finalExamWeight.disabled = false;
            targetGrade.disabled = false;
            
            // Update button state
            updateAddAssessmentButton();
        }
    }
}); 