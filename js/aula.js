const datos = UniverPass.consulta();

if (!datos) {
    document.getElementById("sinConsulta").hidden = false;
} else {
    document.getElementById("aulaFoto").src = datos.foto;
    document.getElementById("aulaNombre").textContent = datos.nombre;
    document.getElementById("aulaMatricula").textContent =
        `Matrícula: ${datos.matricula}`;
    document.getElementById("aulaCarrera").textContent = datos.carrera;
    document.getElementById("aulaCampus").textContent = datos.campus;
    document.getElementById("aulaNumero").textContent = datos.aula;
}
