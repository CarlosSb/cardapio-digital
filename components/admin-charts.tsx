"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

interface AdminChartsProps {
  growth: any[]
  plans: any[]
}

export function AdminCharts({ growth, plans }: AdminChartsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Growth Chart */}
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={growth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(value: any) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(value: any) => new Date(value).toLocaleDateString('pt-BR')}
              formatter={(value: any) => [value, 'Novos restaurantes']}
            />
            <Bar dataKey="count" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Plans Distribution */}
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={plans}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ plan_name, subscription_count }: any) => `${plan_name}: ${subscription_count}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="subscription_count"
            >
              {plans.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b'][index % 3]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}