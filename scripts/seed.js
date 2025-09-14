const { sequelize } = require('../src/config/database')
const {
  Doctor,
  LabTest,
  Pharmacy,
  Medication,
  Vaccination,
  HomeService,
  ServiceProvider,
  DietPlan,
  ExerciseProgram,
  YogaSession,
  FAQ
} = require('../src/models')

async function seed() {
  try {
    console.log('🌱 Starting database seeding...')

    // Seed Doctors
    console.log('👨‍⚕️ Seeding doctors...')
    const doctors = [
      {
        name: 'Dr. Rajesh Kumar',
        specialization: 'Cardiology',
        qualification: 'MBBS, MD Cardiology',
        experience: 15,
        phone: '+91-9876543210',
        email: 'dr.rajesh@hospital.com',
        clinicName: 'Heart Care Clinic',
        consultationFee: 800,
        rating: 4.5,
        isOnlineConsultationAvailable: true,
        availability: {
          monday: ['09:00', '17:00'],
          tuesday: ['09:00', '17:00'],
          wednesday: ['09:00', '17:00'],
          thursday: ['09:00', '17:00'],
          friday: ['09:00', '17:00'],
          saturday: ['09:00', '13:00']
        }
      },
      {
        name: 'Dr. Priya Sharma',
        specialization: 'Dermatology',
        qualification: 'MBBS, MD Dermatology',
        experience: 10,
        phone: '+91-9876543211',
        email: 'dr.priya@skincare.com',
        clinicName: 'Skin Care Center',
        consultationFee: 600,
        rating: 4.7,
        isOnlineConsultationAvailable: true
      },
      {
        name: 'Dr. Amit Patel',
        specialization: 'Orthopedics',
        qualification: 'MBBS, MS Orthopedics',
        experience: 12,
        phone: '+91-9876543212',
        email: 'dr.amit@ortho.com',
        clinicName: 'Bone & Joint Clinic',
        consultationFee: 700,
        rating: 4.3,
        isOnlineConsultationAvailable: false
      }
    ]

    await Doctor.bulkCreate(doctors, { ignoreDuplicates: true })

    // Seed Lab Tests
    console.log('🧪 Seeding lab tests...')
    const labTests = [
      {
        name: 'Complete Blood Count (CBC)',
        description: 'Comprehensive blood analysis',
        category: 'Blood Test',
        price: 300,
        preparationInstructions: 'No special preparation required'
      },
      {
        name: 'Lipid Profile',
        description: 'Cholesterol and lipid levels',
        category: 'Blood Test',
        price: 500,
        preparationInstructions: '12-hour fasting required'
      },
      {
        name: 'Thyroid Function Test',
        description: 'TSH, T3, T4 levels',
        category: 'Hormone Test',
        price: 600,
        preparationInstructions: 'No special preparation required'
      },
      {
        name: 'X-Ray Chest',
        description: 'Chest X-ray imaging',
        category: 'Imaging',
        price: 400,
        preparationInstructions: 'Remove metallic objects'
      }
    ]

    await LabTest.bulkCreate(labTests, { ignoreDuplicates: true })

    // Seed Pharmacies
    console.log('💊 Seeding pharmacies...')
    const pharmacies = [
      {
        name: 'Apollo Pharmacy',
        address: '123 Main Street, Mumbai, Maharashtra',
        phone: '+91-9876543220',
        isDeliveryAvailable: true,
        deliveryRadius: 15
      },
      {
        name: 'MedPlus',
        address: '456 Health Avenue, Delhi',
        phone: '+91-9876543221',
        isDeliveryAvailable: true,
        deliveryRadius: 20
      },
      {
        name: 'Wellness Pharmacy',
        address: '789 Care Street, Bangalore',
        phone: '+91-9876543222',
        isDeliveryAvailable: true,
        deliveryRadius: 10
      }
    ]

    await Pharmacy.bulkCreate(pharmacies, { ignoreDuplicates: true })

    // Seed Medications
    console.log('💉 Seeding medications...')
    const medications = [
      {
        name: 'Paracetamol',
        genericName: 'Acetaminophen',
        manufacturer: 'Sun Pharma',
        strength: '500mg',
        form: 'Tablet',
        price: 50,
        isPrescriptionRequired: false
      },
      {
        name: 'Amoxicillin',
        genericName: 'Amoxicillin',
        manufacturer: 'Cipla',
        strength: '250mg',
        form: 'Capsule',
        price: 120,
        isPrescriptionRequired: true
      },
      {
        name: 'Atorvastatin',
        genericName: 'Atorvastatin',
        manufacturer: 'Ranbaxy',
        strength: '10mg',
        form: 'Tablet',
        price: 200,
        isPrescriptionRequired: true
      }
    ]

    await Medication.bulkCreate(medications, { ignoreDuplicates: true })

    // Seed Vaccinations
    console.log('💉 Seeding vaccinations...')
    const vaccinations = [
      {
        name: 'COVID-19 Vaccine',
        description: 'mRNA vaccine for COVID-19 protection',
        ageGroup: '18+ years',
        doses: 2,
        intervalBetweenDoses: 21,
        price: 0
      },
      {
        name: 'Hepatitis B',
        description: 'Protection against Hepatitis B virus',
        ageGroup: 'All ages',
        doses: 3,
        intervalBetweenDoses: 30,
        price: 500
      },
      {
        name: 'Influenza Vaccine',
        description: 'Annual flu protection',
        ageGroup: '6 months+',
        doses: 1,
        price: 300
      }
    ]

    await Vaccination.bulkCreate(vaccinations, { ignoreDuplicates: true })

    // Seed Home Services
    console.log('🏠 Seeding home services...')
    const homeServices = [
      {
        name: 'House Cleaning',
        category: 'house-help',
        description: 'Professional house cleaning service',
        hourlyRate: 200,
        minimumHours: 2
      },
      {
        name: 'Elderly Companionship',
        category: 'companionship',
        description: 'Companion for elderly care',
        hourlyRate: 300,
        minimumHours: 4
      },
      {
        name: 'Home Nursing',
        category: 'nursing',
        description: 'Professional nursing care at home',
        hourlyRate: 500,
        minimumHours: 2
      },
      {
        name: 'Physiotherapy',
        category: 'physiotherapy',
        description: 'Home physiotherapy sessions',
        hourlyRate: 800,
        minimumHours: 1
      }
    ]

    await HomeService.bulkCreate(homeServices, { ignoreDuplicates: true })

    // Seed Diet Plans
    console.log('🥗 Seeding diet plans...')
    const dietPlans = [
      {
        name: 'Weight Loss Plan',
        description: 'Balanced diet plan for healthy weight loss',
        category: 'weight-loss',
        duration: 30,
        meals: {
          breakfast: ['Oats with fruits', 'Green tea'],
          lunch: ['Brown rice with vegetables', 'Salad'],
          dinner: ['Grilled chicken with quinoa', 'Soup']
        },
        nutritionalInfo: {
          calories: 1500,
          protein: '25%',
          carbs: '40%',
          fat: '35%'
        }
      },
      {
        name: 'Diabetes Management',
        description: 'Low glycemic index diet for diabetics',
        category: 'diabetes',
        duration: 60,
        meals: {
          breakfast: ['Whole grain cereals', 'Low-fat milk'],
          lunch: ['Lean protein with vegetables'],
          dinner: ['Fish with steamed vegetables']
        }
      }
    ]

    await DietPlan.bulkCreate(dietPlans, { ignoreDuplicates: true })

    // Seed Exercise Programs
    console.log('💪 Seeding exercise programs...')
    const exercisePrograms = [
      {
        name: 'Beginner Cardio',
        description: 'Basic cardio workout for beginners',
        level: 'beginner',
        category: 'cardio',
        duration: 30,
        exercises: [
          { name: 'Walking', duration: 10 },
          { name: 'Light jogging', duration: 15 },
          { name: 'Cool down', duration: 5 }
        ]
      },
      {
        name: 'Strength Training',
        description: 'Full body strength workout',
        level: 'intermediate',
        category: 'strength',
        duration: 45,
        exercises: [
          { name: 'Push-ups', sets: 3, reps: 15 },
          { name: 'Squats', sets: 3, reps: 20 },
          { name: 'Lunges', sets: 3, reps: 12 }
        ],
        equipment: ['Dumbbells', 'Exercise mat']
      }
    ]

    await ExerciseProgram.bulkCreate(exercisePrograms, { ignoreDuplicates: true })

    // Seed Yoga Sessions
    console.log('🧘 Seeding yoga sessions...')
    const yogaSessions = [
      {
        name: 'Morning Hatha Yoga',
        description: 'Gentle morning yoga routine',
        level: 'beginner',
        type: 'hatha',
        duration: 30,
        poses: [
          'Mountain Pose',
          'Tree Pose',
          'Warrior I',
          'Child\'s Pose'
        ],
        benefits: ['Improved flexibility', 'Stress relief', 'Better posture']
      },
      {
        name: 'Meditation Session',
        description: 'Guided meditation for relaxation',
        level: 'beginner',
        type: 'meditation',
        duration: 20,
        poses: ['Seated meditation'],
        benefits: ['Stress relief', 'Mental clarity', 'Better sleep']
      }
    ]

    await YogaSession.bulkCreate(yogaSessions, { ignoreDuplicates: true })

    // Seed FAQs
    console.log('❓ Seeding FAQs...')
    const faqs = [
      {
        category: 'General',
        question: 'How do I book an appointment?',
        answer: 'You can book an appointment by navigating to the Medical Services section and selecting your preferred doctor and time slot.',
        order: 1
      },
      {
        category: 'Emergency',
        question: 'How does the SOS feature work?',
        answer: 'The SOS feature allows you to quickly send your location and emergency alert to your pre-configured emergency contacts and emergency services.',
        order: 2
      },
      {
        category: 'Medical',
        question: 'Can I cancel my lab test booking?',
        answer: 'Yes, you can cancel your lab test booking up to 2 hours before the scheduled time through the Medical Services section.',
        order: 3
      },
      {
        category: 'Home Services',
        question: 'How are service providers verified?',
        answer: 'All service providers go through a thorough background check and verification process including identity verification, experience validation, and reference checks.',
        order: 4
      },
      {
        category: 'Payment',
        question: 'What payment methods are accepted?',
        answer: 'We accept all major credit cards, debit cards, UPI payments, and digital wallets.',
        order: 5
      }
    ]

    await FAQ.bulkCreate(faqs, { ignoreDuplicates: true })

    console.log('🎉 Database seeding completed successfully!')
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  } finally {
    await sequelize.close()
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seed()
}

module.exports = seed