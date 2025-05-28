from django import forms
from .models import Medico, Paciente, Cita, Receta, Especialidad

class EspecialidadForm(forms.ModelForm):
    class Meta:
        model = Especialidad
        fields = ['nombre']

class MedicoForm(forms.ModelForm):
    class Meta:
        model = Medico
        fields = ['nombre', 'telefono', 'especialidad']

class PacienteForm(forms.ModelForm):
    class Meta:
        model = Paciente
        fields = ['nombre', 'cedula', 'direccion', 'telefono']

class CitaForm(forms.ModelForm):
    class Meta:
        model = Cita
        fields = ['fecha', 'hora', 'paciente', 'medico']
        widgets = {
            'fecha': forms.DateInput(attrs={'type': 'date'}),
            'hora': forms.TimeInput(attrs={'type': 'time'}),
        }

class RecetaForm(forms.ModelForm):
    class Meta:
        model = Receta
        fields = ['descripcion', 'cita']