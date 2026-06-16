from flask import Flask, render_template, request, jsonify
import os
import json
from datetime import datetime

app = Flask(__name__)

# Menu options and their responses
MENU_OPTIONS = {
    '1': {
        'title': 'Admissions Information',
        'content': '''📋 ADMISSIONS INFORMATION
        
• Application Deadline: Rolling admissions
• Required Documents: High School Transcript, SAT/ACT Scores, Essays, Letters of Recommendation
• Application Fee: $75
• Average GPA: 3.8
• Average Test Scores: SAT 1450, ACT 33

Steps to Apply:
1. Visit our website and fill out the application form
2. Submit your transcripts and test scores
3. Write two essays about your background
4. Get three letters of recommendation
5. Submit your application with $75 fee
6. Wait for decision (4-6 weeks)

Questions? Contact admissions@university.edu'''
    },
    '2': {
        'title': 'Contact Information',
        'content': '''📞 CONTACT INFORMATION

Main Campus Address:
123 University Drive, Education City, ST 12345

Phone Numbers:
• General Inquiries: 1-800-UNIV-HELP
• Admissions Office: (555) 123-4567
• Student Services: (555) 123-4568
• Financial Aid: (555) 123-4569

Email Addresses:
• General: contact@university.edu
• Admissions: admissions@university.edu
• Financial Aid: finaid@university.edu
• Student Support: support@university.edu

Office Hours:
Monday - Friday: 9:00 AM - 5:00 PM
Saturday: 10:00 AM - 2:00 PM
Sunday: Closed

Website: www.university.edu'''
    },
    '3': {
        'title': 'Academic Programs',
        'content': '''🎓 ACADEMIC PROGRAMS

Computer Science:
• BS in Computer Science
• MS in Computer Science
• PhD in Computer Science

Business Administration:
• BS in Business Administration
• MBA (2-year program)

Engineering:
• BS in Civil Engineering
• BS in Mechanical Engineering
• BS in Electrical Engineering
• MS in Engineering (various specializations)

Arts and Sciences:
• BA in Biology
• BA in Chemistry
• BA in Physics
• BA in History
• BA in English Literature

Medicine and Health Sciences:
• MD (Doctor of Medicine)
• DDS (Doctor of Dental Surgery)
• MS in Public Health

Law:
• JD (Juris Doctor)
• LLM (Master of Laws)

Education:
• BS in Education
• MEd (Master of Education)'''
    },
    '4': {
        'title': 'Campus Facilities',
        'content': '''🏫 CAMPUS FACILITIES

Libraries:
• Main Library (2 million books)
• Science Library
• Law Library
• 24-hour study spaces

Research Facilities:
• Advanced research laboratories
• Computer science labs
• Biology & Chemistry labs
• Engineering workshops

Sports & Recreation:
• Olympic-sized swimming pool
• Fitness centers
• Basketball & volleyball courts
• Tennis courts
• Soccer fields
• Indoor sports complex

Student Housing:
• On-campus housing for 8,000+ students
• Residential colleges
• Graduate student housing
• Wellness communities

Dining & Amenities:
• 5 dining halls
• Food courts
• Café & coffee shops
• Student center
• Recreation center

Technology:
• High-speed internet campus-wide
• Computer labs with latest software
• Technology support 24/7
• Smart classrooms'''
    },
    '5': {
        'title': 'Tuition & Financial Aid',
        'content': '''💰 TUITION AND FINANCIAL AID

Tuition Costs (2024-2025):
• Undergraduate Tuition: $55,000/year
• Graduate Tuition: $40,000/year
• Room and Board: $15,000/year
• Books and Supplies: $1,200/year

Financial Aid Available:
• Merit-based scholarships: $5,000 - $30,000/year
• Need-based grants: Up to 100% of demonstrated need
• Federal loans available
• Work-study programs

Types of Aid:
1. Scholarships (no repayment)
2. Grants (no repayment)
3. Work-Study (earn while studying)
4. Federal Loans (must repay)
5. Private Loans (alternative option)

Application Process:
• Submit FAFSA by January 15
• Meet with financial aid advisor
• Receive aid package
• Discuss repayment options

Contact Financial Aid: finaid@university.edu'''
    },
    '6': {
        'title': 'Student Life',
        'content': '''🎉 STUDENT LIFE

Clubs & Organizations:
• 200+ student clubs
• Academic clubs
• Cultural organizations
• Sports clubs
• Professional societies

Sports:
• 15+ NCAA Division I sports
• Intramural sports
• Club sports
• Recreation programs

Cultural Events:
• Theater productions
• Concert series
• Art exhibitions
• Film festivals
• Lectures & seminars

Learning Opportunities:
• Research opportunities
• Internship programs
• Study abroad (50+ countries)
• Service learning
• Peer tutoring

Support Services:
• Career counseling
• Mental health services
• Academic advising
• Disability services
• International student support

Residential Life:
• Living-learning communities
• Residential activities
• Community service
• Leadership development
• Cultural immersion programs'''
    },
    '7': {
        'title': 'About University',
        'content': '''ℹ️ ABOUT OUR UNIVERSITY

Mission:
To provide world-class education and foster innovation through excellence in teaching, research, and community engagement.

History:
Founded in 1985, our university has grown to become a leading institution of higher education serving students and communities globally.

Statistics:
• 15,000+ students
• 800+ faculty members
• 200+ academic programs
• 50,000+ alumni
• Present in 120 countries

Accreditations:
• Middle States Commission on Higher Education
• AACSB (Business)
• ABET (Engineering)
• ABA (Law)
• Accreditation Commission for Schools of Medicine

Rankings:
• Top 50 National Universities
• Top 30 Business Schools
• Top 25 Engineering Programs
• Top 40 Law Schools

Campus Size:
• 800 acres
• State-of-the-art facilities
• Green campus initiatives
• Sustainable practices

Values:
✓ Academic Excellence
✓ Innovation
✓ Diversity & Inclusion
✓ Community Engagement
✓ Integrity
✓ Global Perspective'''
    }
}

# Load university data
def load_university_data():
    try:
        with open('documents/university_data.txt', 'r') as f:
            return f.read()
    except:
        return "University data not available"

# Get menu display
def get_menu_display():
    menu = "UNIVERSITY CHATBOT MENU\n\n"
    menu += "Select an option by typing the number:\n\n"
    menu += "1. Admissions Information\n"
    menu += "2. Contact Information\n"
    menu += "3. Academic Programs\n"
    menu += "4. Campus Facilities\n"
    menu += "5. Tuition & Financial Aid\n"
    menu += "6. Student Life\n"
    menu += "7. About University\n\n"
    menu += "Or ask any question in your own words!"
    return menu

# Chatbot logic with menu support
def get_chatbot_response(user_input):
    user_input = user_input.strip()
    
    # Check if user selected a menu option
    if user_input in MENU_OPTIONS:
        return MENU_OPTIONS[user_input]['content']
    
    # Natural language processing
    user_lower = user_input.lower()
    
    # Advanced keyword mapping
    keyword_responses = {
        'menu': get_menu_display(),
        'help': get_menu_display(),
        'hello': 'Hello! Welcome to our University Chatbot. Type "menu" to see options or ask any question!',
        'hi': 'Hi there! Type "menu" to see what information I can provide.',
        'admissions': MENU_OPTIONS['1']['content'],
        'admission': MENU_OPTIONS['1']['content'],
        'contact': MENU_OPTIONS['2']['content'],
        'programs': MENU_OPTIONS['3']['content'],
        'academic': MENU_OPTIONS['3']['content'],
        'campus': MENU_OPTIONS['4']['content'],
        'facilities': MENU_OPTIONS['4']['content'],
        'tuition': MENU_OPTIONS['5']['content'],
        'fees': MENU_OPTIONS['5']['content'],
        'financial': MENU_OPTIONS['5']['content'],
        'aid': MENU_OPTIONS['5']['content'],
        'student': MENU_OPTIONS['6']['content'],
        'life': MENU_OPTIONS['6']['content'],
        'about': MENU_OPTIONS['7']['content'],
        'university': MENU_OPTIONS['7']['content'],
        'thanks': 'You\'re welcome! Feel free to ask me anything else. Type "menu" for options.',
        'thank you': 'Happy to help! Is there anything else? Type "menu" for options.',
        'bye': 'Goodbye! Have a wonderful day!',
        'goodbye': 'Goodbye! Feel free to come back anytime!'
    }
    
    # Check for keyword matches
    for keyword, response in keyword_responses.items():
        if keyword in user_lower:
            return response
    
    # Default response
    return 'I didn\'t quite understand that. Type "menu" to see available options, or ask me about admissions, programs, campus, or contact information!'

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message', '')
    
    if not user_message:
        return jsonify({'error': 'Empty message'}), 400
    
    bot_response = get_chatbot_response(user_message)
    
    return jsonify({
        'user_message': user_message,
        'bot_response': bot_response,
        'timestamp': datetime.now().strftime('%H:%M:%S')
    })

@app.route('/get-menu', methods=['GET'])
def get_menu():
    return jsonify({'menu': get_menu_display()})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
