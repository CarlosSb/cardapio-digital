import { RestaurantForm } from "@/components/restaurant-form";
import { FormRestaurantSkeleton, TextSkeleton } from "@/components/skeletons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Restaurante</h1>
        <p className="text-muted-foreground">Configure as informações do seu restaurante</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle><TextSkeleton className="max-w-48" /></CardTitle>
          <CardDescription>
            <TextSkeleton className="md:w-1/2 w-full"/>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormRestaurantSkeleton />
        </CardContent>
      </Card>
    </div>
  );
}
