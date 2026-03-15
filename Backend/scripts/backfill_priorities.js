const db = require('../config/db');
const priorityService = require('../services/priorityService');

const backfillPriorities = async () => {
    try {
        console.log('Fetching all complaints to recalculate priority scores...');
        const result = await db.query('SELECT id, issue_type, ward_id FROM complaints');
        const complaints = result.rows;

        console.log(`Found ${complaints.length} complaints to update.`);

        for (const complaint of complaints) {
            const scores = await priorityService.calculatePriority(
                complaint.issue_type,
                complaint.ward_id
            );

            await db.query(
                `UPDATE complaints 
                 SET priority_score = $1, impact_score = $2, recurrence_score = $3 
                 WHERE id = $4`,
                [scores.priority_score, scores.impact_score, scores.recurrence_score, complaint.id]
            );

            console.log(`  #${complaint.id} [${complaint.issue_type}] → priority: ${scores.priority_score}`);
        }

        console.log('Backfill complete!');
        process.exit(0);
    } catch (error) {
        console.error('Error backfilling priorities:', error);
        process.exit(1);
    }
};

backfillPriorities();
