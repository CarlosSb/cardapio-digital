import { CategoryTableSkeleton } from "@/components/skeletons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";

export default function Loading() {
  return (
        <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Cardápio</h1>
        <p className="text-muted-foreground">Gerencie os itens do seu cardápio</p>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list">Lista de Itens</TabsTrigger>
          <TabsTrigger value="add">Adicionar Item</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Seus Itens do Cardápio</CardTitle>
              <CardDescription>Gerencie os pratos do seu restaurante</CardDescription>
            </CardHeader>
            <CardContent>
                <CategoryTableSkeleton />            
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>

  )
}
