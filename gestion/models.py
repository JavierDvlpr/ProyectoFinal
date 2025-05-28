from django.db import models

class Especialidad(models.Model):
    nombre = models.CharField(max_length=100)
    
    class Meta:
        db_table = 'especialidades' 

    def __str__(self):
        return self.nombre


class Medico(models.Model):
    nombre = models.CharField(max_length=100)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    especialidad = models.ForeignKey(Especialidad, null=True, blank=True, on_delete=models.SET_NULL)
    
    class Meta:
        db_table = 'medicos' 

    def __str__(self):
        return self.nombre


class Paciente(models.Model):
    nombre = models.CharField(max_length=100)
    cedula = models.CharField(max_length=20, unique=True)
    direccion = models.TextField(blank=True, null=True)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    
    class Meta:
        db_table = 'pacientes' 

    def __str__(self):
        return f"{self.nombre} ({self.cedula})"
    
    

class Cita(models.Model):
    fecha = models.DateField()
    hora = models.TimeField()
    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE)
    medico = models.ForeignKey(Medico, on_delete=models.CASCADE)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        db_table = 'citas' 

    def __str__(self):
        return f"Cita {self.id} - {self.fecha} {self.hora}"


class Receta(models.Model):
    descripcion = models.TextField()
    cita = models.OneToOneField(Cita, on_delete=models.CASCADE)
    
    class Meta:
        db_table = 'recetas' 

    def __str__(self):
        return f"Receta para cita {self.cita.id}"


class ConsultaReporte(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True, null=True)
    sql = models.TextField()
    
    class Meta:
        db_table = 'consultas_reportes' 

    def __str__(self):
        return self.nombre
    
