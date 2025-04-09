document.addEventListener('DOMContentLoaded', function() {
    // Add html2canvas script
    const html2canvasScript = document.createElement('script');
    html2canvasScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    html2canvasScript.integrity = 'sha512-BNaRQnYJYiPSqHHDb58B0yaPfCu+Wgds8Gp/gU33kqBtgNS4tSPHuGibyoeqMV/TJlSKda6FXzoEyYGjTe+vXA==';
    html2canvasScript.crossOrigin = 'anonymous';
    html2canvasScript.referrerPolicy = 'no-referrer';
    document.head.appendChild(html2canvasScript);
    
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
    const justPassBtn = document.getElementById('justPassBtn');
    const bestPossibleGrade = document.getElementById('bestPossibleGrade');
    const maxPossibleGrade = document.getElementById('maxPossibleGrade');
    const displayFinalExamWeight = document.getElementById('displayFinalExamWeight');
    const displayTargetGrade = document.getElementById('displayTargetGrade');
    const saveAsPngBtn = document.getElementById('saveAsPng');
    
    // Section elements for collapsing/expanding
    const assessmentForm = document.querySelector('.assessment-form');
    const assessmentFormToggle = document.createElement('button');
    assessmentFormToggle.className = 'toggle-btn';
    assessmentFormToggle.innerHTML = '<i class="fas fa-chevron-up"></i> Hide Assessments Form';
    assessmentForm.prepend(assessmentFormToggle);
    
    const resultsSection = document.querySelector('.results-section');
    const gradeDisplay = document.querySelector('.grade-display');
    
    // Store assessments
    let finalAssessments = [];
    let isEditingMode = false;
    
    // Load saved data
    loadFromLocalStorage();
    
    // Initialize placeholder styling
    updateSelectPlaceholderStyle(finalAssessmentName);
    
    // Check if we should collapse the form initially
    checkWeightStatusAndToggleForm();
    
    // Toggle assessment form visibility
    assessmentFormToggle.addEventListener('click', function() {
        toggleAssessmentForm();
    });
    
    // Just Want to Pass button
    justPassBtn.addEventListener('click', function() {
        targetGrade.value = 50;
        calculateNeededGrade();
        saveToLocalStorage();
    });
    
    // Handle course name changes
    courseName.addEventListener('input', function() {
        updateCourseNameDisplay();
        saveToLocalStorage();
    });
    
    // Update course name display
    function updateCourseNameDisplay() {
        let displayText = courseName.value.trim();
        if (!displayText) {
            displayText = 'Course Name';
        }
        courseNameDisplay.textContent = displayText;
    }
    
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
            
            // Convert to number and ensure it's between 0 and 100
            let value = parseInt(this.value);
            if (isNaN(value)) {
                this.value = '';
            } else {
                this.value = Math.max(0, Math.min(100, value));
            }
            
            saveToLocalStorage();
        });
    });
    
    // Update calculations when final exam or target grade changes
    [finalExamWeight, targetGrade].forEach(input => {
        input.addEventListener('input', function() {
            calculateNeededGrade();
            updateExamInfoDisplay();
            checkWeightStatusAndToggleForm();
            saveToLocalStorage();
        });
    });
    
    // Function to toggle assessment form
    function toggleAssessmentForm() {
        const isCollapsed = assessmentForm.classList.contains('collapsed');
        
        if (isCollapsed) {
            // Expand
            assessmentForm.classList.remove('collapsed');
            assessmentFormToggle.innerHTML = '<i class="fas fa-chevron-up"></i> Hide Assessments Form';
            
            // Scroll to the form
            assessmentForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            // Collapse
            assessmentForm.classList.add('collapsed');
            assessmentFormToggle.innerHTML = '<i class="fas fa-chevron-down"></i> Show Assessments Form';
            
            // Scroll to results if not in editing mode
            if (!isEditingMode) {
                gradeDisplay.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }
    
    // Check if weight is achieved and toggle form accordingly
    function checkWeightStatusAndToggleForm() {
        const examWeight = parseInt(finalExamWeight.value) || 0;
        if (!examWeight) return;
        
        const totalCurrentWeight = calculateTotalWeight(finalAssessments);
        const expectedAssessmentWeight = 100 - examWeight;
        
        // If weight is achieved and we have assessments and not in editing mode, collapse the form
        if (totalCurrentWeight === expectedAssessmentWeight && finalAssessments.length > 0 && !isEditingMode) {
            if (!assessmentForm.classList.contains('collapsed')) {
                assessmentForm.classList.add('collapsed');
                assessmentFormToggle.innerHTML = '<i class="fas fa-chevron-down"></i> Show Assessments Form';
                
                // Scroll to results
                setTimeout(() => {
                    gradeDisplay.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 300);
            }
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
    
    // Add assessment in final exam mode
    addFinalAssessmentBtn.addEventListener('click', function() {
        addFinalAssessment();
    });
    
    function getAssessmentName(select, customInput) {
        return select.value === 'custom' ? customInput.value.trim() : select.value;
    }
    
    function addFinalAssessment() {
        const name = getAssessmentName(finalAssessmentName, finalCustomAssessment);
        const weight = parseInt(finalAssessmentWeight.value);
        const grade = parseInt(finalAssessmentGrade.value);
        
        if (!name || isNaN(weight) || isNaN(grade) || finalAssessmentName.value === "") {
            alert('Please fill out all fields correctly.');
            return;
        }
        
        const examWeight = parseInt(finalExamWeight.value) || 0;
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
            weighted: (weight * grade) / 100
        };
        
        finalAssessments.push(assessment);
        isEditingMode = false;
        renderFinalAssessments();
        calculateNeededGrade();
        resetForm(finalAssessmentName, finalCustomAssessment, finalAssessmentWeight, finalAssessmentGrade);
        saveToLocalStorage();
        
        // Check if we should collapse the form
        checkWeightStatusAndToggleForm();
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
                <td class="percent-cell">${assessment.weight}</td>
                <td class="percent-cell">${assessment.grade}</td>
                <td class="percent-cell">${assessment.weighted.toFixed(2)}</td>
                <td class="actions-cell">
                    <button class="edit-btn" data-index="${index}"><i class="fas fa-edit"></i> Edit</button>
                    <button class="delete-btn" data-index="${index}"><i class="fas fa-trash"></i> Delete</button>
                </td>
            `;
            
            finalAssessmentsList.appendChild(row);
        });
        
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
        if (assessmentForm.classList.contains('collapsed')) {
            assessmentForm.classList.remove('collapsed');
            assessmentFormToggle.innerHTML = '<i class="fas fa-chevron-up"></i> Hide Assessments Form';
        }
        
        // Populate form with assessment data
        if (assessment.name === 'Test' || assessment.name === 'Midterm' || 
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
        
        // Scroll to the form and focus on the first field
        assessmentForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
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
        const examWeight = parseInt(finalExamWeight.value) || 0;
        const desiredGrade = parseInt(targetGrade.value) || 0;
        const totalCurrentWeight = calculateTotalWeight(finalAssessments);
        const currentWeightedSum = calculateWeightedSum(finalAssessments);
        
        finalTotalWeightElement.textContent = totalCurrentWeight;
        bestPossibleGrade.classList.add('hidden');
        
        // Update the exam info display
        updateExamInfoDisplay();
        
        // Validate inputs
        if (examWeight === 0 || desiredGrade === 0) {
            neededGradeElement.textContent = '0';
            neededGradeMessage.textContent = 'Please enter your final exam weight and target grade.';
            return;
        }
        
        // Check if assessments weight + final exam weight = 100%
        const totalWeight = totalCurrentWeight + examWeight;
        const expectedAssessmentWeight = 100 - examWeight;
        
        // Show warning if current assessment weights don't equal expected value
        if (totalCurrentWeight !== expectedAssessmentWeight) {
            const difference = expectedAssessmentWeight - totalCurrentWeight;
            let warningMessage = '';
            
            if (difference > 0) {
                warningMessage = `<i class="fas fa-exclamation-triangle"></i> Your current assessments total <strong>${totalCurrentWeight}%</strong> but should equal <strong>${expectedAssessmentWeight}%</strong> (100% - ${examWeight}% final exam weight). You need to add <strong>${difference}%</strong> more weight.`;
            } else {
                warningMessage = `<i class="fas fa-exclamation-triangle"></i> Your current assessments total <strong>${totalCurrentWeight}%</strong> but should equal <strong>${expectedAssessmentWeight}%</strong> (100% - ${examWeight}% final exam weight). You need to remove <strong>${Math.abs(difference)}%</strong> weight.`;
            }
            
            finalWeightWarning.innerHTML = warningMessage;
            finalWeightWarning.style.display = 'block';
        } else {
            finalWeightWarning.style.display = 'none';
        }
        
        if (totalCurrentWeight === 0) {
            finalCurrentGradeElement.textContent = '0';
        } else {
            // Calculate current grade based on existing assessments
            const currentGrade = currentWeightedSum / (totalCurrentWeight / 100);
            finalCurrentGradeElement.textContent = currentGrade.toFixed(2);
        }
        
        // Calculate needed grade
        const pointsNeeded = (desiredGrade * totalWeight / 100) - currentWeightedSum;
        const neededGrade = (pointsNeeded / examWeight) * 100;
        
        if (neededGrade < 0) {
            neededGradeElement.textContent = '0';
            neededGradeMessage.textContent = 'You have already achieved your target grade!';
        } else if (neededGrade > 100) {
            neededGradeElement.textContent = 'Impossible';
            neededGradeMessage.textContent = 'You cannot achieve your target grade with the current assessments.';
            
            // Calculate best possible grade (assuming 100% on final)
            const maxPoints = currentWeightedSum + (examWeight * 1); // 1 = 100%
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
        displayFinalExamWeight.textContent = finalExamWeight.value || '0';
        displayTargetGrade.textContent = targetGrade.value || '0';
    }
    
    // Save calculator state to local storage
    function saveToLocalStorage() {
        const calculatorState = {
            courseName: courseName.value,
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
                updateExamInfoDisplay();
                
                // Restore assessments
                if (calculatorState.assessments && Array.isArray(calculatorState.assessments)) {
                    finalAssessments = calculatorState.assessments;
                    renderFinalAssessments();
                }
                
                // Restore form collapsed state
                if (calculatorState.isFormCollapsed) {
                    assessmentForm.classList.add('collapsed');
                    assessmentFormToggle.innerHTML = '<i class="fas fa-chevron-down"></i> Show Assessments Form';
                }
                
                // Recalculate everything
                calculateNeededGrade();
            } catch (error) {
                console.error('Error loading saved data:', error);
                // If there's an error, clear local storage
                localStorage.removeItem('gradeCalculatorState');
            }
        }
    }
    
    // Add reset button functionality
    const resetButton = document.getElementById('resetCalculator');
    resetButton.addEventListener('click', function() {
        if (confirm('Are you sure you want to reset the calculator? All your data will be cleared.')) {
            localStorage.removeItem('gradeCalculatorState');
            location.reload();
        }
    });
    
    // Initialize calculation on page load
    calculateNeededGrade();
    
    // Save Results as PNG
    saveAsPngBtn.addEventListener('click', function() {
        if (typeof html2canvas !== 'function') {
            alert('Screenshot library is still loading. Please try again in a moment.');
            return;
        }
        
        // First, check if there's any data to save
        if (finalAssessments.length === 0 || !finalExamWeight.value || !targetGrade.value) {
            alert('Please add some assessments and set your final exam weight and target grade before saving.');
            return;
        }
        
        // Show a loading state
        saveAsPngBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        saveAsPngBtn.disabled = true;
        
        // Create a timestamp for the filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        
        // Apply special styles for screenshot
        resultsSection.classList.add('screenshot-mode');
        
        // Take the screenshot after a small delay to ensure styles are applied
        setTimeout(() => {
            html2canvas(resultsSection, {
                backgroundColor: '#ffffff',
                scale: 2, // Higher quality
                logging: false,
                allowTaint: true,
                useCORS: true
            }).then(canvas => {
                // Reset styles
                resultsSection.classList.remove('screenshot-mode');
                
                // Convert to image and download
                const image = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.download = `grade-calculation-${timestamp}.png`;
                link.href = image;
                link.click();
                
                // Reset button
                saveAsPngBtn.innerHTML = '<i class="fas fa-download"></i> Save as PNG';
                saveAsPngBtn.disabled = false;
            }).catch(err => {
                console.error('Error generating screenshot:', err);
                alert('Sorry, there was an error generating the screenshot. Please try again.');
                
                // Reset styles and button
                resultsSection.classList.remove('screenshot-mode');
                saveAsPngBtn.innerHTML = '<i class="fas fa-download"></i> Save as PNG';
                saveAsPngBtn.disabled = false;
            });
        }, 100);
    });
}); 