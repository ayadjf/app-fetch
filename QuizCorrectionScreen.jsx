import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const QuizCorrectionScreen = ({ route }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [studentAnswers, setStudentAnswers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  const { studentId, quizId, token } = route.params; // Assuming these are passed via navigation

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const correctionData = await fetchCorrectionDataForQuestion(studentId, quizId, currentQuestion + 1, token);
        setCorrectAnswers(correctionData.correctAnswers);
        setStudentAnswers(correctionData.studentAnswer);
      } catch (error) {
        console.error('Error fetching correction data:', error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [studentId, quizId, currentQuestion, token]);

  const question = questions[currentQuestion];
  const selectedAnswer = studentAnswers.answer;
  const isCorrect = selectedAnswer === correctAnswers[0]?.answer; // Assuming `answer` is the correct one
  
  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Grade')}> 
          <Text style={styles.menu}>≡</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Quiz 05 : Generalities</Text>
      </View>
      <Text style={styles.Text}>Correction of the Quiz</Text>

      {/* Question Progress Bar */}
      <View style={styles.progressBarWrapper}>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            {questions.map((q, index) => {
              const isCorrect = studentAnswers[q.id] === correctAnswers[q.id]?.answer;
              return (
                <View 
                  key={q.id} 
                  style={[styles.progressItem, isCorrect ? styles.correctAnswer : styles.wrongAnswer]}
                > 
                  <Text style={styles.progressText}>{q.id}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      <View style={[styles.questionBox, isCorrect ? styles.correctBox : styles.wrongBox]}>
        <Text style={styles.questionText}>Question 0{question.id}</Text>
        <Text style={styles.question}>{question.question}</Text>
        <Text style={styles.questionText2}>Choose an answer</Text>
        <Text style={isCorrect ? styles.correctText : styles.wrongText}>
          {isCorrect ? 'Correct' : 'Wrong'}
        </Text>
      </View>

      {question.options.map((option, index) => {
        const isSelected = option === selectedAnswer;
        const isCorrectOption = option === question.correctAnswer;

        return (
          <View
            key={index}
            style={[
              styles.option,
              isSelected ? (isCorrect ? styles.correct : styles.wrong) : isCorrectOption ? styles.correct : styles.neutral
            ]}
          >
            <View style={[styles.optionLetter, styles[`optionLetter${index}`]]}>
              <Text style={styles.letterText}>{String.fromCharCode(65 + index)}</Text>
            </View>
            <Text style={styles.optionText}>{option}</Text>
          </View>
        );
      })}

      <View style={styles.navigation}>
        {currentQuestion > 0 && (
          <TouchableOpacity onPress={() => setCurrentQuestion(currentQuestion - 1)} style={styles.button0}>
            <Text style={styles.buttonText1}>Previous</Text>
          </TouchableOpacity>
        )}
        {currentQuestion < questions.length - 1 ? (
          <TouchableOpacity 
            onPress={() => setCurrentQuestion(currentQuestion + 1)} 
            style={[styles.button1, currentQuestion === 0 && styles.firstQuestionButton]}
          >
            <Text style={styles.buttonText2}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            onPress={() => navigation.navigate('Grade')} 
            style={styles.button2}
          >
            <Text style={styles.buttonText1}>End</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// Fetch function to get correction data from backend
export async function fetchCorrectionDataForQuestion(studentId, quizId, questionId, token) {
  try {
    const correctResponse = await fetch(`http://localhost:7000/api/answers/question/${questionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const correctData = await correctResponse.json();

    if (!correctResponse.ok) {
      throw new Error(correctData.message || 'Error loading correct answers');
    }

    const studentResponse = await fetch(`http://localhost:7000/api/answers/student-answer/${studentId}/${quizId}/${questionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const studentData = await studentResponse.json();

    if (!studentResponse.ok) {
      throw new Error(studentData.message || 'Error loading student answer');
    }

    return {
      correctAnswers: correctData.answers,
      studentAnswer: studentData.answer,
    };
  } catch (error) {
    console.error('Error fetching correction data:', error.message);
    throw error;
  }
}




const styles = StyleSheet.create({
  header: {flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  menu: { fontSize: 24, fontWeight: 'bold', marginRight: 10 },
  container: { flex: 1, padding: 20, backgroundColor: '#fff', bottom: -30 },
  title: { fontSize: 20, fontWeight: 'bold'},
  questionBox: { padding: 15, borderWidth: 2, borderRadius: 20, marginBottom: 15,weight:900,height:180,top:40,width:350,alignSelf:'center', 
    shadowOffset: { width: 4, height: 100}, // Drop shadow direction
    shadowOpacity: -100, // Adjust opacity (lower = lighter shadow)
    shadowRadius: 6, // Increase for a softer shadow
    elevation: 20, // Required for Android
  },
  navigation: { flexDirection: 'row', justifyContent: 'space-between' },

  correctBox: { borderColor: 'green' , backgroundColor: '#fff', padding: 40, borderRadius: 20, shadowColor: 'rgb(13, 132, 45)', height: 180, top: 40, width: 350, alignSelf: 'center', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.6, shadowRadius: 6, elevation: 6},
  wrongBox: { borderColor: 'red', backgroundColor: '#fff', padding: 40, borderRadius: 20, shadowColor: 'rgb(215, 36, 36)', height: 180, top: 40, width: 350, alignSelf: 'center', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.6, shadowRadius: 6, elevation: 6 },
  option: { alignSelf:'center', flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 10, padding: 10, marginBottom: 25,bottom:-70,width:330 },
  correct: { borderColor: 'green', backgroundColor: '#d4edda' },
  wrong: { borderColor: 'red', backgroundColor: '#f8d7da' },
  neutral: { borderColor: '#ddd' },
  button0: { backgroundColor: 'rgba(24, 79, 120, 0.2)', shadowColor: '#184F78', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 14, borderRadius: 10, padding: 10, top: 120, width: 162 },
  button1: { backgroundColor: 'rgba(24, 79, 120, 1)', shadowColor: '#184F78', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 5, borderRadius: 10, padding: 10, top: 120, width: 162 },
  firstQuestionButton: { left:210,padding: 10, top: 200, width: 162 },
  button2: { backgroundColor: '#FEDC62', shadowColor: '#184F78', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 5, borderRadius: 10, padding: 10, top: 120, width: 162 },
  buttonText2: { color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  buttonText1: { color: '#184F78', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  Text: { color: '000', fontSize: 24, fontWeight: 'bold' ,textAlign:'center',marginBottom:10 ,fontFamily:'poppins'},
  questionText: { fontSize: 20, fontWeight: 'bold', marginBottom: 15,top:-10,left:-15 },
  questionText2: { fontSize: 20, fontWeight: 'medium', marginBottom: 10,color:' rgb(173, 168, 168)',left:-15,top:-10},
  question: { fontSize: 20, color: '#000',fontWeight: 'light', marginBottom: 10 ,left:-15,top:-10},
  correctText: { color: 'green',  fontSize: 20, fontWeight: 'bold', marginBottom: -5,left:-30 ,top:-200},
  wrongText: { color: 'red', fontSize: 20, fontWeight: 'bold', marginBottom: -5,left:-30 ,top:-200},
 
  progressItem: {  width: 30, height: 30, borderRadius: 0, marginLeft:0,marginRight:0,
    backgroundColor: '#184F78', marginHorizontal: 5, alignItems: 'center', justifyContent: 'center'  },
  progressText: { color: '#fff', fontWeight: 'bold',fontSize:18 },
  correctAnswer: { backgroundColor: '#C3E8C9' },
  wrongAnswer: { backgroundColor: 'rgb(244, 143, 151)' },
  optionLetter: {
    width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 10 ,backgroundColor:'rgba(18, 7, 8, 0.1)',
    shadowColor:'#000', 
    shadowOffset: { width: 0, height: 20}, // Moins de déplacement
    shadowOpacity: 2, // Moins intense
    shadowRadius: 20, // Ajuste la diffusion
    elevation: 20, // Pour Android
  },
  letterText: {
    color: '#fff', fontWeight:'900' , fontSize: 16
  },
  optionText: {
    fontSize: 16, color: '#000', textAlign:'center'
  },
  progressBarWrapper: {
    height:30,
    borderRadius:90,
    backgroundColor: '#f0f0f0', // Couleur du rectangle en dessous
    paddingVertical: -20,
    marginBottom: 20,
  },
  progressBar: { flexDirection: 'row', justifyContent: 'center' },
  progressItem: { 
    width: 30, height: 30, borderRadius: 0, marginLeft:0,marginRight:0,
     marginHorizontal: 5, alignItems: 'center', justifyContent: 'center' 
  },
});


export default QuizCorrectionScreen;
