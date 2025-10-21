"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

const guidanceItems = {
  "La Tasación de la Vivienda": [
    "Una tasación es una opinión profesional e imparcial del valor de una vivienda, requerida por el prestamista.",
    "El tasador evalúa el estado, tamaño, características de la propiedad y la compara con viviendas similares vendidas recientemente en la zona.",
    "Una tasación baja puede poner en peligro tu préstamo. Es posible que necesites renegociar el precio con el vendedor o aumentar tu entrada.",
    "Recibirás una copia del informe de tasación. Revísalo cuidadosamente para verificar su exactitud.",
  ],
  "La Visita Final": [
    "Generalmente se realiza 24-48 horas antes del cierre.",
    "Verifica que la propiedad esté en las mismas condiciones que cuando acordaste comprarla.",
    "Asegúrate de que todas las reparaciones acordadas se hayan completado. Lleva los recibos y la documentación.",
    "Prueba todos los electrodomésticos, la fontanería y los sistemas eléctricos por última vez.",
    "Confirma que todos los artículos incluidos en la venta (como electrodomésticos o cortinas) todavía estén presentes.",
  ],
  "Día del Cierre: Qué Esperar": [
    "La reunión de cierre es donde la propiedad de la vivienda se transfiere oficialmente a ti.",
    "Estarás firmando una gran cantidad de documentos legales, incluyendo la escritura de la hipoteca y el título de propiedad.",
    "Las figuras clave que asistirán pueden incluirte a ti, al vendedor, al agente de cierre y a los abogados.",
    "¡Haz preguntas! No firmes nada que no entiendas completamente. El agente de cierre está allí para explicar los documentos.",
  ],
  "Qué Llevar al Cierre": [
    "Un documento de identidad con foto emitido por el gobierno (p. ej., DNI, pasaporte).",
    "Un cheque bancario o prueba de transferencia para tus gastos de cierre y la entrada.",
    "Una copia de tu contrato de compraventa y cualquier otro documento relevante.",
    "Prueba del seguro de hogar.",
    "Tu talonario de cheques para cualquier gasto menor e inesperado de última hora.",
  ],
};

type GuidanceCategory = keyof typeof guidanceItems;

export default function ClosingGuidance() {
  return (
    <Card className="w-full shadow-lg border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">Guía para el Cierre</CardTitle>
        <CardDescription>
          Navegando los pasos finales en el viaje de la compra de tu vivienda.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible defaultValue="La Tasación de la Vivienda" className="w-full">
          {Object.entries(guidanceItems).map(([category, items]) => (
            <AccordionItem value={category} key={category}>
              <AccordionTrigger className="text-xl font-headline hover:no-underline">{category}</AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-3 pt-2">
                  {items.map((item, index) => (
                    <li key={`${category}-item-${index}`} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                      <span className="text-base">{item}</span>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
