import { formatRaceTime } from '../../utils/typingRace';

export default function TeamLeaderboard({ teams, title = 'Рейтинг команд' }) {
    if (!teams?.length) return null;

    return (
        <section>
            <h3 className="text-lg font-bold">{title}</h3>
            <ol className="mt-4 space-y-3">
                {teams.map((team) => (
                    <li
                        key={team.team_id}
                        className="flex items-center justify-between gap-4 rounded-xl border border-border bg-bg px-4 py-3"
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-sm font-extrabold text-primary">
                                {team.rank_position}
                            </span>
                            <div className="min-w-0">
                                <p className="font-semibold truncate">{team.team_name}</p>
                                <p className="text-xs text-muted">Команда #{team.team_id}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-mono text-lg font-bold">{formatRaceTime(team.completion_time_ms)}</p>
                            <p className="text-xs text-muted">час проходження</p>
                        </div>
                    </li>
                ))}
            </ol>
        </section>
    );
}
