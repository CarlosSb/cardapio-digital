import { CardsSkeleton, CategoryTableSkeleton, TextSkeleton } from '@/components/skeletons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Loading() {
  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Categorias</h1>
        <TextSkeleton className="md:w-1/2 w-full" />
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list">Lista de Categorias</TabsTrigger>
          <TabsTrigger value="add">Adicionar Categoria</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Suas Categorias</CardTitle>
              <CardDescription>Gerencie as categorias do seu cardápio</CardDescription>
            </CardHeader>
            <CardContent>
              <CategoryTableSkeleton />
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </main>
  );
}

