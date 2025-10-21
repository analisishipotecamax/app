"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const checklistItems = {
  Exterior: [
    "Estado del tejado (tejas, canalones)",
    "Estado de los cimientos (grietas, daños por agua)",
    "Condición del revestimiento/ladrillo",
    "Jardín y paisajismo (drenaje, salud de los árboles)",
    "Ventanas y puertas (sellos, marcos, funcionamiento)",
    "Estado de la terraza/patio",
  ],
  Interior: [
    "Señales de daños por agua en techos o paredes",
    "Estado del suelo",
    "Grietas en paredes y techos",
    "Funcionalidad de puertas y ventanas",
    "Espacio de almacenamiento adecuado (armarios, gabinetes)",
    "Distribución general y fluidez de la casa",
  ],
  Cocina: [
    "Antigüedad y estado de los electrodomésticos",
    "Suficiente espacio en encimeras y armarios",
    "Revisar si hay fugas debajo del fregadero",
    "Funcionalidad de grifos y triturador de basura",
    "Estado de encimeras y armarios",
  ],
  Baños: [
    "Revisar si hay fugas (grifos, base del inodoro)",
    "Presión del agua en la ducha y el lavabo",
    "Señales de moho o hongos",
    "Funcionalidad del extractor de aire",
    "Estado de azulejos, lechada y sellador",
  ],
  Sistemas: [
    "Antigüedad y estado del sistema de climatización (calefacción y aire acondicionado)",
    "Antigüedad y estado del calentador de agua",
    "Revisar el cuadro eléctrico (antigüedad, capacidad, etiquetado)",
    "Probar interruptores y enchufes",
    "Preguntar sobre el material de las tuberías (p. ej., cobre, PEX, galvanizado)",
  ],
  Vecindario: [
    "Comprobar los niveles de ruido a diferentes horas del día",
    "Proximidad a servicios (colegios, parques, tiendas)",
    "Observar el mantenimiento general de las propiedades vecinas",
    "Investigar las tasas de criminalidad locales",
    "Consultar cambios de zonificación o próximas construcciones",
  ],
};

type ChecklistCategory = keyof typeof checklistItems;

const ChecklistItem = ({ id, label }: { id: string, label: string }) => (
  <div className="flex items-center space-x-3 py-2">
    <Checkbox id={id} />
    <Label htmlFor={id} className="text-base font-normal leading-relaxed cursor-pointer">{label}</Label>
  </div>
);

export default function ViewingChecklist() {
  return (
    <Card className="w-full shadow-lg border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">Lista para la Visita a la Propiedad</CardTitle>
        <CardDescription>
          Puntos clave a inspeccionar durante la visita a una casa antes de firmar cualquier contrato.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" defaultValue={["Exterior", "Interior"]} className="w-full">
          {Object.entries(checklistItems).map(([category, items]) => (
            <AccordionItem value={category} key={category}>
              <AccordionTrigger className="text-xl font-headline hover:no-underline">{category}</AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-2 pt-2">
                  {items.map((item, index) => (
                    <ChecklistItem key={`${category}-${index}`} id={`${category}-${index}`} label={item} />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
