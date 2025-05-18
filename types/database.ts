export type Tenant = {
  id: number
  name: string
  owner_name: string
  email: string
  whatsapp_number: string | null
  created_at: string
  updated_at: string
}

export type WhatsappInstance = {
  id: number
  tenant_id: number
  phone_number: string
  session_name: string
  qrcode: string | null
  status: string
  created_at: string
  updated_at: string
}

export type Client = {
  id: number
  tenant_id: number
  name: string
  whatsapp: string
  created_at: string
  updated_at: string
}

export type Barber = {
  id: number
  tenant_id: number
  name: string
  specialty: string | null
  status: string
  created_at: string
  updated_at: string
}

export type Service = {
  id: number
  tenant_id: number
  name: string
  duration: number
  price: number
  description: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export type Appointment = {
  id: number
  tenant_id: number
  client_id: number
  barber_id: number
  service_id: number
  date: string
  start_time: string
  end_time: string
  status: string
  created_at: string
  updated_at: string
}

export type ShopSettings = {
  id: number
  tenant_id: number
  opening_time: string
  closing_time: string
  days_open: number[]
  slot_duration: number
  cancellation_policy: string | null
  created_at: string
  updated_at: string
}

export type UserTenant = {
  id: number
  user_id: string
  tenant_id: number
  role: string
  created_at: string
  updated_at: string
}

export type AppointmentWithDetails = Appointment & {
  client: Client
  barber: Barber
  service: Service
}
