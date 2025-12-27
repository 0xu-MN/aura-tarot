import { useParams, Navigate } from 'react-router-dom';
import { LoveTarot } from './contents/LoveTarot';
import { MoneyTarot } from './contents/MoneyTarot';
import { ReunionTarot } from './contents/ReunionTarot';
import { YearlyFortune } from './contents/YearlyFortune';
import { Horoscope } from './contents/Horoscope';
import { PalmReading } from './contents/PalmReading';
import { StudentSupportTarot } from './contents/StudentSupportTarot';

const TarotReading = () => {
    const { type } = useParams();

    // Map type param to component
    switch (type) {
        case 'love':
            return <LoveTarot />;
        case 'money':
            return <MoneyTarot />;
        case 'reunion':
            return <ReunionTarot />;
        case 'yearly':
            return <YearlyFortune />;
        case 'horoscope':
            return <Horoscope />;
        case 'palm':
            return <PalmReading />;
        case 'student':
            return <StudentSupportTarot />;
        default:
            return <Navigate to="/contents" replace />;
    }
};

export default TarotReading;
