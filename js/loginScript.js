function showForm(role) {
    document.getElementById('form-paciente').style.display = 'none';
    document.getElementById('form-medico').style.display = 'none';
    document.getElementById('form-admin').style.display = 'none';

    document.getElementById('tab-paciente').classList.remove('active');
    document.getElementById('tab-medico').classList.remove('active');
    document.getElementById('tab-admin').classList.remove('active');

    if (role === 'paciente') {
        document.getElementById('form-paciente').style.display = 'block';
        document.getElementById('tab-paciente').classList.add('active');
    } else if (role === 'medico') {
        document.getElementById('form-medico').style.display = 'block';
        document.getElementById('tab-medico').classList.add('active');
    } else if (role === 'administrador') {
        document.getElementById('form-admin').style.display = 'block';
        document.getElementById('tab-admin').classList.add('active');
    }
}
