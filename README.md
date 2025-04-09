# Final Exam Calculator

A web-based calculator that helps students determine what grade they need on their final exam to achieve their desired overall course grade.

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