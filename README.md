# Final Exam Calculator

A web-based calculator that helps students determine what grade they need on their final exam to achieve their desired overall course grade.

![Final Exam Calculator Screenshot](https://github.com/lucasreydman/what-do-i-need-on-my-final/raw/main/screenshot.png)

## Features

- Calculate the required final exam grade to achieve a target overall grade
- Track multiple completed assessments with their weights and grades
- Save calculator state between sessions using local storage
- Export your calculation as a PNG image
- Automatically calculate if your target grade is achievable
- Mobile-friendly responsive design
- One-click "I Just Want to Pass" button for quick 50% target setting

## How to Use

1. Enter your course name (optional)
2. Input the weight of your final exam (as a percentage)
3. Set your target overall grade
4. Add your completed assessments:
   - Select the assessment type or create a custom one
   - Enter the weight of the assessment
   - Input the grade you received
   - Click "Add Assessment"
5. View your results:
   - Current weighted grade
   - Required grade on the final exam
   - Whether your target is achievable

If your target grade isn't achievable, the calculator will show you the maximum possible grade you can achieve.

## Installation

No installation required! This is a client-side web application that runs entirely in your browser.

### To Run Locally

1. Clone this repository:
   ```
   git clone https://github.com/lucasreydman/what-do-i-need-on-my-final.git
   ```
2. Open `index.html` in your web browser

### Deploy with GitHub Pages

1. Fork or push this repository to your GitHub account
2. Go to your repository settings
3. Scroll down to the "GitHub Pages" section
4. Under "Source", select "main" branch
5. Click "Save"
6. Your site will be published at `https://yourusername.github.io/what-do-i-need-on-my-final/`

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- [html2canvas](https://html2canvas.hertzen.com/) for PNG export
- [Font Awesome](https://fontawesome.com/) for icons

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Created by Lucas Reydman