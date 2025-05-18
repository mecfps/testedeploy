import { createServerSupabaseClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "WhatsApp - AgendAI Barber",
  description: "Integração com WhatsApp",
}

async function getWhatsAppInstances(tenantId: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("whatsapp_instances").select("*").eq("tenant_id", tenantId)

  if (error) {
    console.error("Error fetching WhatsApp instances:", error)
    return []
  }

  return data || []
}

export default async function WhatsAppPage({ params }: { params: { tenantId: string } }) {
  const { tenantId } = params
  const instances = await getWhatsAppInstances(tenantId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Integração com WhatsApp</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Nova Instância</CardTitle>
            <CardDescription>Conecte um novo número de WhatsApp à sua barbearia</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone_number">Número de Telefone</Label>
                <Input id="phone_number" name="phone_number" placeholder="Ex: 5511999999999" />
                <p className="text-xs text-gray-500">Formato internacional, sem espaços ou caracteres especiais.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="session_name">Nome da Sessão</Label>
                <Input id="session_name" name="session_name" placeholder="Ex: Barbearia Principal" />
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Criar Instância
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Instâncias Existentes</CardTitle>
            <CardDescription>Gerencie suas conexões de WhatsApp</CardDescription>
          </CardHeader>
          <CardContent>
            {instances.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhuma instância de WhatsApp encontrada.</p>
            ) : (
              <div className="space-y-4">
                {instances.map((instance) => (
                  <div key={instance.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-medium">{instance.session_name}</h3>
                        <p className="text-sm text-gray-500">{instance.phone_number}</p>
                      </div>
                      <Badge
                        className={
                          instance.status === "connected"
                            ? "bg-green-500"
                            : instance.status === "pending"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }
                      >
                        {instance.status === "connected"
                          ? "Conectado"
                          : instance.status === "pending"
                            ? "Pendente"
                            : "Desconectado"}
                      </Badge>
                    </div>

                    {instance.status === "pending" && instance.qrcode && (
                      <div className="flex flex-col items-center space-y-2 mb-4">
                        <p className="text-sm text-center">Escaneie o QR Code para conectar</p>
                        <div className="bg-white p-2 rounded-lg">
                          <Image src={instance.qrcode || "/placeholder.svg"} alt="QR Code" width={200} height={200} />
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        Atualizar
                      </Button>
                      <Button variant="destructive" size="sm">
                        Excluir
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sobre a Integração com WhatsApp</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              A integração com WhatsApp permite que sua barbearia envie mensagens automáticas para seus clientes, como:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Confirmação de agendamentos</li>
              <li>Lembretes de consultas</li>
              <li>Notificações de cancelamento</li>
              <li>Promoções e novidades</li>
            </ul>
            <p>
              Para utilizar esta funcionalidade, você precisa conectar um número de WhatsApp à plataforma através do QR
              Code.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
