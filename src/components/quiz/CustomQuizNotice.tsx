/**
 * Aviso que se muestra en los tests creados por usuarios: el contenido no lo
 * revisa QuizLab. Protege la confianza en la marca y reduce el riesgo legal.
 */
export function CustomQuizNotice() {
  return (
    <p className="text-xs text-ink-soft">
      Test creado por un usuario de QuizLab. Su contenido no ha sido revisado por QuizLab.
    </p>
  );
}
