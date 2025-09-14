// Import all models
const User = require('./User')
const EmergencyContact = require('./EmergencyContact')
const SOSAlert = require('./SOSAlert')
const Reminder = require('./Reminder')
const { Doctor, Appointment } = require('./Medical')
const { LabTest, LabBooking, VirtualQueue } = require('./Lab')
const { Pharmacy, Medication, PrescriptionOrder } = require('./Pharmacy')
const { PatientTransfer, Vaccination, VaccinationBooking } = require('./PatientTransfer')
const { HomeService, ServiceProvider, HomeServiceBooking, AssistanceRequest } = require('./HomeService')
const { DietPlan, ExerciseProgram, YogaSession, UserWellnessSubscription } = require('./Wellness')
const { FamilyMember, MedicalHistory, HealthPermission } = require('./Family')
const { Dispute, SupportTicket, TicketMessage, FAQ } = require('./Support')

// Define relationships

// User relationships
User.hasMany(EmergencyContact, { foreignKey: 'userId', as: 'emergencyContacts' })
EmergencyContact.belongsTo(User, { foreignKey: 'userId', as: 'user' })

User.hasMany(SOSAlert, { foreignKey: 'userId', as: 'sosAlerts' })
SOSAlert.belongsTo(User, { foreignKey: 'userId', as: 'user' })

User.hasMany(Reminder, { foreignKey: 'userId', as: 'reminders' })
Reminder.belongsTo(User, { foreignKey: 'userId', as: 'user' })

User.hasMany(Appointment, { foreignKey: 'userId', as: 'appointments' })
Appointment.belongsTo(User, { foreignKey: 'userId', as: 'user' })
Appointment.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'doctor' })
Doctor.hasMany(Appointment, { foreignKey: 'doctorId', as: 'appointments' })

User.hasMany(LabBooking, { foreignKey: 'userId', as: 'labBookings' })
LabBooking.belongsTo(User, { foreignKey: 'userId', as: 'user' })

User.hasMany(VirtualQueue, { foreignKey: 'userId', as: 'queueEntries' })
VirtualQueue.belongsTo(User, { foreignKey: 'userId', as: 'user' })

User.hasMany(PrescriptionOrder, { foreignKey: 'userId', as: 'prescriptionOrders' })
PrescriptionOrder.belongsTo(User, { foreignKey: 'userId', as: 'user' })
PrescriptionOrder.belongsTo(Pharmacy, { foreignKey: 'pharmacyId', as: 'pharmacy' })
Pharmacy.hasMany(PrescriptionOrder, { foreignKey: 'pharmacyId', as: 'orders' })

User.hasMany(PatientTransfer, { foreignKey: 'userId', as: 'patientTransfers' })
PatientTransfer.belongsTo(User, { foreignKey: 'userId', as: 'user' })

User.hasMany(VaccinationBooking, { foreignKey: 'userId', as: 'vaccinationBookings' })
VaccinationBooking.belongsTo(User, { foreignKey: 'userId', as: 'user' })
VaccinationBooking.belongsTo(Vaccination, { foreignKey: 'vaccinationId', as: 'vaccination' })
Vaccination.hasMany(VaccinationBooking, { foreignKey: 'vaccinationId', as: 'bookings' })

User.hasMany(HomeServiceBooking, { foreignKey: 'userId', as: 'homeServiceBookings' })
HomeServiceBooking.belongsTo(User, { foreignKey: 'userId', as: 'user' })
HomeServiceBooking.belongsTo(HomeService, { foreignKey: 'serviceId', as: 'service' })
HomeServiceBooking.belongsTo(ServiceProvider, { foreignKey: 'providerId', as: 'provider' })
HomeService.hasMany(HomeServiceBooking, { foreignKey: 'serviceId', as: 'bookings' })
ServiceProvider.hasMany(HomeServiceBooking, { foreignKey: 'providerId', as: 'bookings' })

User.hasMany(AssistanceRequest, { foreignKey: 'userId', as: 'assistanceRequests' })
AssistanceRequest.belongsTo(User, { foreignKey: 'userId', as: 'user' })

User.hasMany(UserWellnessSubscription, { foreignKey: 'userId', as: 'wellnessSubscriptions' })
UserWellnessSubscription.belongsTo(User, { foreignKey: 'userId', as: 'user' })

// Family relationships
User.hasMany(FamilyMember, { foreignKey: 'userId', as: 'familyMembers' })
FamilyMember.belongsTo(User, { foreignKey: 'userId', as: 'user' })

User.hasMany(MedicalHistory, { foreignKey: 'userId', as: 'medicalHistory' })
MedicalHistory.belongsTo(User, { foreignKey: 'userId', as: 'user' })
FamilyMember.hasMany(MedicalHistory, { foreignKey: 'familyMemberId', as: 'medicalHistory' })
MedicalHistory.belongsTo(FamilyMember, { foreignKey: 'familyMemberId', as: 'familyMember' })

User.hasMany(HealthPermission, { foreignKey: 'granterUserId', as: 'grantedPermissions' })
User.hasMany(HealthPermission, { foreignKey: 'granteeUserId', as: 'receivedPermissions' })
HealthPermission.belongsTo(User, { foreignKey: 'granterUserId', as: 'granter' })
HealthPermission.belongsTo(User, { foreignKey: 'granteeUserId', as: 'grantee' })
HealthPermission.belongsTo(FamilyMember, { foreignKey: 'familyMemberId', as: 'familyMember' })

// Support relationships
User.hasMany(Dispute, { foreignKey: 'userId', as: 'disputes' })
Dispute.belongsTo(User, { foreignKey: 'userId', as: 'user' })

User.hasMany(SupportTicket, { foreignKey: 'userId', as: 'supportTickets' })
SupportTicket.belongsTo(User, { foreignKey: 'userId', as: 'user' })

SupportTicket.hasMany(TicketMessage, { foreignKey: 'ticketId', as: 'messages' })
TicketMessage.belongsTo(SupportTicket, { foreignKey: 'ticketId', as: 'ticket' })

module.exports = {
  User,
  EmergencyContact,
  SOSAlert,
  Reminder,
  Doctor,
  Appointment,
  LabTest,
  LabBooking,
  VirtualQueue,
  Pharmacy,
  Medication,
  PrescriptionOrder,
  PatientTransfer,
  Vaccination,
  VaccinationBooking,
  HomeService,
  ServiceProvider,
  HomeServiceBooking,
  AssistanceRequest,
  DietPlan,
  ExerciseProgram,
  YogaSession,
  UserWellnessSubscription,
  FamilyMember,
  MedicalHistory,
  HealthPermission,
  Dispute,
  SupportTicket,
  TicketMessage,
  FAQ
}