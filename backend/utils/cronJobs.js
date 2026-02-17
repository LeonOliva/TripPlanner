const cron = require('node-cron');
const Viaggio = require('../models/itinerario'); 

const startCronJobs = () => {
    // Esegue il controllo OGNI MINUTO (per testare)
    cron.schedule('*/1 * * * *', async () => {
        try {
            const adesso = new Date();
            
            // CANCELLA SE: dataInizio è minore (<) di adesso.
            // Significa che il viaggio è già iniziato (o passato).
            const risultato = await Viaggio.deleteMany({ 
                dataInizio: { $lt: adesso } 
            });

            if (risultato.deletedCount > 0) {
                console.log(`🗑️ PULIZIA: Cancellati ${risultato.deletedCount} viaggi perché già partiti.`);
            } 
        } catch (error) {
            console.error("❌ Errore cron job:", error);
        }
    });
};

module.exports = startCronJobs;