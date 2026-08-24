"use client"

import { MoreHorizontal } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { leads, type LeadStatus } from "@/lib/crm-data"

const statusStyles: Record<LeadStatus, string> = {
  quente: "bg-chart-5/12 text-chart-5 border-chart-5/25",
  morno: "bg-chart-4/15 text-chart-4 border-chart-4/30",
  frio: "bg-chart-2/12 text-chart-2 border-chart-2/25",
  fechado: "bg-chart-3/15 text-chart-3 border-chart-3/30",
}

const statusLabel: Record<LeadStatus, string> = {
  quente: "Quente",
  morno: "Morno",
  frio: "Frio",
  fechado: "Fechado",
}

export function LeadsTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Leads recentes</CardTitle>
        <CardDescription>
          Oportunidades atualizadas nas últimas 24 horas
        </CardDescription>
        <CardAction>
          <Button variant="outline" size="sm">
            Ver todos
          </Button>
        </CardAction>
      </CardHeader>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Contato</TableHead>
            <TableHead className="hidden md:table-cell">Etapa</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden lg:table-cell">Responsável</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">
                    {lead.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {lead.company}
                  </span>
                </div>
              </TableCell>
              <TableCell className="hidden text-muted-foreground md:table-cell">
                {lead.stage}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn("font-medium", statusStyles[lead.status])}
                >
                  {statusLabel[lead.status]}
                </Badge>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <div className="flex items-center gap-2">
                  <Avatar className="size-7">
                    <AvatarFallback className="bg-secondary text-xs text-secondary-foreground">
                      {lead.ownerInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">
                    {lead.owner}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right font-medium tabular-nums">
                {lead.value}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Ações para ${lead.name}`}
                      />
                    }
                  >
                    <MoreHorizontal />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuGroup>
                      <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                      <DropdownMenuItem>Registrar atividade</DropdownMenuItem>
                      <DropdownMenuItem>Avançar etapa</DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
