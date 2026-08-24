"use client"

import { useState, useEffect, use } from "react"
import { getPatientWithRecords, addRecord, getUpcomingAppointments, deleteRecord } from "../../actions"
import { PageTitle, Status } from "@/components/crm/clinical-ui"
import { 
  ChevronLeft, 
  ChevronRight, 
  Bell, 
  MessageCircle, 
  X, 
  Clock,
  CheckCircle2,
  AlertCircle,
  Trash2
} from "lucide-react"

export default function PatientRecord({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [patientData, setPatientData] = useState({
    patient: null,
    records: [],
    totalRecords: 0,
    totalPages: 0,
    loading: true
  })
  const [page, setPage] = useState(0)
  const limit = 10
  const [showForm, setShowForm] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<{id: number, title: string, startsAt: string, patientName: string}[]>([])
  const [chiefComplaint, setChiefComplaint] = useState("")
  const [interventions, setInterventions] = useState("")
  const [observations, setObservations] = useState("")
  const [progress, setProgress] = useState("")

  // Fetch patient and records when page changes
  useEffect(() => {
    const fetchData = async () => {
      setPatientData(prev => ({ ...prev, loading: true }))
      
      const formData = new FormData()
      formData.append("patientId", id)
      formData.append("page", String(page))
      
      try {
        const result = await getPatientWithRecords(formData)
        setPatientData({
          patient: result.patient,
          records: result.records,
          totalRecords: result.totalRecords,
          totalPages: result.totalPages,
          loading: false
        })
      } catch (error) {
        console.error("Failed to fetch patient data:", error)
        setPatientData(prev => ({ ...prev, loading: false, patient: null }))
      }
    }
    
    fetchData()
  }, [id, page])

  // Fetch upcoming appointments for notifications
  useEffect(() => {
    if (!patientData.patient?.id) return
    
    const fetchAppointments = async () => {
      try {
        const formData = new FormData()
        formData.append("patientId", String(patientData.patient.id))
        const result = await getUpcomingAppointments(formData)
        setNotifications(result.appointments || [])
      } catch (error) {
        console.error("Failed to fetch appointments:", error)
      }
    }
    
    fetchAppointments()
  }, [patientData.patient?.id, showNotifications])

  // Handle form submission for new record
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!patientData.patient?.id) return

    try {
      // Combine structured fields into content for storage
      const content = `
Queixa principal: ${chiefComplaint}
Intervenções realizadas: ${interventions}
Observações e encaminhamentos: ${observations}
Avaliação do progresso: ${progress || "Não informado"}
      `.trim()
      
      const formData = new FormData()
      formData.append("patientId", String(patientData.patient.id))
      formData.append("content", content)
      formData.append("sessionDate", new Date().toISOString())
      
      await addRecord(formData)
      
      // Reset form
      setChiefComplaint("")
      setInterventions("")
      setObservations("")
      setProgress("")
      setShowForm(false)
      
      // Refetch records (reset to first page to show the new record)
      setPage(0)
    } catch (error) {
      console.error("Failed to add record:", error)
    }
  }

  const { patient, records: recordsData, totalRecords, totalPages, loading } = patientData

  // Handle delete record
  const handleDeleteRecord = async (recordId: number) => {
    if (!window.confirm("Tem certeza que deseja excluir esta evolução?")) return
    
    try {
      const formData = new FormData()
      formData.append("id", String(recordId))
      formData.append("patientId", String(patient.id))
      await deleteRecord(formData)
      
      // Refetch records
      setPage(0)
    } catch (error) {
      console.error("Failed to delete record:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/50 border-t-primary/100"></div>
          <p className="text-sm">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Paciente não encontrado</p>
      </div>
    )
  }

  // Compute status badge and text
  const statusText = patient.status === "ativo" ? "Ativo" : patient.status === "pausado" ? "Pausado" : patient.status === "alta" ? "Alta" : "Inativo"
  const statusClass = patient.status === "ativo" ? "bg-primary/10 text-primary" : patient.status === "pausado" ? "bg-warning/10 text-warning" : patient.status === "alta" ? "bg-success/10 text-success" : "bg-muted/20 text-muted-foreground"

  return (
    <main className="min-h-screen bg-gradient-to-b from-background/50 to-background p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.history.back()}
            className="hover:text-muted-foreground/70 transition-colors p-1 rounded hover:bg-muted/5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-semibold">{patient.name}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z" />
              </svg>
              <span>{new Intl.DateTimeFormat("pt-BR", { 
                year: "numeric", 
                month: "long", 
                day: "numeric" 
              }).format(new Date())}</span>
            </div>
          </div>
        </div>
        
        {/* Notification Bell */}
        <button 
          onClick={() => setShowNotifications(!showNotifications)}
          className={`hover:text-muted-foreground/70 transition-colors p-1 rounded hover:bg-muted/5 ${showNotifications ? 'text-primary' : ''}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.025-.577 1.362C5.773 14.642 5 12.686 5 10.5V5a2 2 0 114 0v5" />
          </svg>
        </button>
        
        {/* Add Evolution Button */}
        <button 
          onClick={() => setShowForm(true)}
          className="hover:text-muted-foreground/70 transition-colors p-1 rounded hover:bg-muted/5"
          title="Nova evolução"
        >
          <MessageCircle className="h-4 w-4" />
        </button>
      </div>

      {/* Patient Info Card */}
      <section className="mb-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="bg-card p-4 rounded-xl border">
            <h3 className="font-semibold mb-2">Informações do Paciente</h3>
            <p className="text-sm"><strong>Idade:</strong> {patient.age || "Não informado"}</p>
            <p className="text-sm"><strong>Telefone:</strong> {patient.phone || "Não informado"}</p>
            <p className="text-sm"><strong>E-mail:</strong> {patient.email || "Não informado"}</p>
            <p className="text-sm"><strong>Data de Nascimento:</strong> {patient.birthDate || "Não informado"}</p>
          </div>
          
          <div className="bg-card p-4 rounded-xl border">
            <h3 className="font-semibold mb-2">Status do Tratamento</h3>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusClass}`}>
              {statusText}
            </span>
            <p className="mt-2 text-sm"><strong>Frequência:</strong> {patient.frequency || "semanal"}</p>
            <p className="text-sm"><strong>Valor da Sessão:</strong> R$ {(patient.sessionPriceCents || 0) / 100}</p>
            <p className="text-sm"><strong>Queixa Principal:</strong> {patient.mainComplaint || "Não informada"}</p>
          </div>
          
          <div className="bg-card p-4 rounded-xl border">
            <h3 className="font-semibold mb-2">Estatísticas</h3>
            <p className="text-sm"><strong>Total de Evoluções:</strong> {totalRecords}</p>
            <p className="text-sm"><strong>Última Evolução:</strong> 
              {recordsData[0] ? 
                new Intl.DateTimeFormat("pt-BR", { 
                  dateStyle: "short", 
                  timeStyle: "short" 
                }).format(new Date(recordsData[0].sessionDate)) : 
                "Nenhuma"}
            </p>
          </div>
        </div>
      </section>

      {/* New Evolution Form */}
      {showForm && (
        <section className="bg-card p-6 rounded-xl border mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Nova Evolução</h2>
            <button 
              onClick={() => setShowForm(false)}
              className="hover:text-muted-foreground/70 transition-colors p-1 rounded hover:bg-muted/5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <input 
              type="hidden" 
              name="patientId" 
              value={patient.id} 
            />
            
            {/* Structured Template */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Queixa Principal da Sessão *
                </label>
                <textarea
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  placeholder="Descreva o motivo da consulta desta sessão..."
                  className="h-20 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Intervenções Realizadas *
                </label>
                <textarea
                  value={interventions}
                  onChange={(e) => setInterventions(e.target.value)}
                  placeholder="Técnicas, exercícios, abordagens utilizadas..."
                  className="h-20 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Observações e Encaminhamentos
                </label>
                <textarea
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Observações clínicas, encaminhamentos, tarefas para casa..."
                  className="h-20 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Avaliação do Progresso
                </label>
                <select
                  value={progress}
                  onChange={(e) => setProgress(e.target.value)}
                  className="h-9 rounded-lg border bg-background px-3 py-2 text-sm w-full focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">Selecione uma opção...</option>
                  <option value="excelente">Excelente</option>
                  <option value="bom">Bom</option>
                  <option value="regular">Regular</option>
                  <option value="necessita_melhoria">Necessita Melhoria</option>
                  <option value="piorou">Piorou</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4">
              <button 
                type="submit" 
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                disabled={!(chiefComplaint && interventions)}
              >
                Salvar Evolução
              </button>
              <button 
                type="button" 
                onClick={() => setShowForm(false)}
                className="rounded-lg bg-muted/20 px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/30"
              >
                Cancelar
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Evolution History */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">
            Histórico de Evoluções ({totalRecords} no total)
          </h2>
          {totalPages > 1 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <button 
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="hover:text-muted-foreground/70 transition-colors p-1 rounded hover:bg-muted/5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span>Página {page + 1} de {totalPages}</span>
              <button 
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page === totalPages - 1}
                className="hover:text-muted-foreground/70 transition-colors p-1 rounded hover:bg-muted/5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
        
        {recordsData.length > 0 ? (
          <div className="space-y-4">
            {recordsData.map((record) => (
              <article 
                key={record.id} 
                className="bg-card p-5 rounded-xl border border-muted/20"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      {new Intl.DateTimeFormat("pt-BR", { 
                        dateStyle: "long", 
                        timeStyle: "short" 
                      }).format(new Date(record.sessionDate))}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleDeleteRecord(record.id)}
                    className="hover:text-destructive/70 transition-colors p-1 rounded hover:bg-destructive/5 text-xs"
                    title="Excluir evolução"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                  {record.content}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-center py-8 text-muted-foreground">
            Ainda não há evoluções neste prontuário. Comece adicionando a primeira evolução abaixo.
          </p>
        )}
      </section>

      {/* Notifications Panel */}
      {showNotifications && (
        <section className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-background rounded-xl border max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 p-6 border-b">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="hover:text-muted-foreground/70 transition-colors p-1 rounded hover:bg-muted/5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-2xl font-semibold">Notificações</h1>
                  <p className="text-sm text-muted-foreground">Agendamentos em aproximadamente 1 hora</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {notifications.length > 0 ? (
                <div className="space-y-3">
                  {notifications.map((appt) => (
                    <article key={appt.id} className="bg-card p-5 rounded-xl border border-muted/20">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <AlertCircle className="h-6 w-6 text-primary" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold">{appt.title}</h3>
                          <p className="text-sm text-muted-foreground truncate">{appt.patientName || "Paciente não identificado"}</p>
                          <p className="text-sm font-medium text-primary">
                            <Clock className="h-4 w-4 inline mr-1" />
                            {new Intl.DateTimeFormat("pt-BR", { 
                              dateStyle: "short", 
                              timeStyle: "short" 
                            }).format(new Date(appt.startsAt))}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 rounded text-xs font-medium bg-primary/10 text-primary">
                            Em ~1 hora
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum agendamento próximo</h3>
                  <p className="text-muted-foreground">Não há agendamentos nas próximas 1 hora.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}