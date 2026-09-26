import { useLanguage } from '@/context/LanguageContext';
import { TagFilter } from '@/components/TagFilter';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type GuideCardProps = {
    image: string;
    title: string;
    subtitle: string;
};

export default function GuidesScreen() {
  const { ui } = useLanguage();
    const router = useRouter();

    const categories = [
        'Gratis',
        'Comida',
        'Miradores',
        'Museos',
        'Noche',
    ];

    const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
    const [search, setSearch] = useState('');

    const guides = [
        {
            image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785',
            title: ui("Los mejores rooftops de NYC"),
            subtitle: ui("12 lugares con vistas increíbles"),
            category: 'Miradores',
        },
        {
            image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba',
            title: ui("Broadway para principiantes"),
            subtitle: ui("Cómo conseguir entradas baratas"),
            category: 'Noche',
        },
        {
            image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
            title: ui("Miradores imprescindibles"),
            subtitle: ui("Top 10 vistas de Manhattan"),
            category: 'Miradores',
        },
        {
            image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
            title: ui("Dónde comer bien y barato"),
            subtitle: ui("Restaurantes favoritos locales"),
            category: 'Comida',
        },
        {
            image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262',
            title: ui("Museos que debes visitar"),
            subtitle: ui("Arte, historia y cultura"),
            category: 'Museos',
        },
        {
            image: 'https://images.unsplash.com/photo-1518391846015-55a9cc003b25',
            title: ui("Los mejores lugares para fotos"),
            subtitle: ui("Instagram spots en NYC"),
            category: 'Gratis',
        },
    ];

    const filteredGuides = guides.filter((g) => {
            const matchCategory =
                selectedCategory.length === 0 ||
                selectedCategory.includes(g.category);

            const matchSearch =
                g.title.toLowerCase().includes(search.toLowerCase()) ||
                g.subtitle.toLowerCase().includes(search.toLowerCase());

            return matchCategory && matchSearch;
        });

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
            >
                {/* HEADER CON BACK */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={26} color="#D4AF37" />
                    </TouchableOpacity>

                    <Text style={styles.title}>{ui("GUÍAS NYC")}</Text>

                    <View style={{ width: 26 }} />
                </View>

                <Text style={styles.subtitle}>{ui("Descubre lugares, experiencias y secretos de Nueva York.")}</Text>

                {/* SEARCH */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#888" />
                    <TextInput
                        placeholder={ui("Buscar guía...")}
                        placeholderTextColor="#888"
                        style={styles.searchInput}
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>

                <TagFilter options={categories} selected={selectedCategory} onChange={setSelectedCategory} countResults={(tags) => guides.filter((guide) => (tags.length === 0 || tags.includes(guide.category)) && (guide.title.toLowerCase().includes(search.toLowerCase()) || guide.subtitle.toLowerCase().includes(search.toLowerCase()))).length} />

                {/* FEATURED */}
                <Text style={styles.sectionTitle}>{ui("Destacada de la semana")}</Text>

                {(selectedCategory.length === 0 || selectedCategory.includes('Gratis')) && ui("50 cosas gratis para hacer en NYC").toLowerCase().includes(search.toLowerCase()) && <TouchableOpacity style={styles.featuredCard}>
                    <Image
                        source={{
                            uri: 'https://images.unsplash.com/photo-1522083165195-3424ed129620',
                        }}
                        style={styles.featuredImage}
                    />
                    <View style={styles.featuredOverlay}>
                        <Text style={styles.featuredBadge}>{ui("DESTACADA")}</Text>
                        <Text style={styles.featuredTitle}>{ui("50 cosas gratis para hacer en NYC")}</Text>
                        <Text style={styles.featuredDescription}>{ui("Museos, parques, miradores y experiencias sin gastar dinero.")}</Text>
                    </View>
                </TouchableOpacity>}

                {/* GUIDES */}
                <Text style={styles.sectionTitle}>{ui("Más guías")}</Text>

                {filteredGuides.map((g, index) => (
                    <GuideCard
                        key={index}
                        image={g.image}
                        title={g.title}
                        subtitle={g.subtitle}
                    />
                ))}

                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

/* CARD */
function GuideCard({ image, title, subtitle }: GuideCardProps) {
    return (
        <TouchableOpacity style={styles.guideCard}>
            <Image source={{ uri: image }} style={styles.guideImage} />
            <View style={styles.guideContent}>
                <Text style={styles.guideTitle}>{title}</Text>
                <Text style={styles.guideSubtitle}>{subtitle}</Text>
            </View>
        </TouchableOpacity>
    );
}

/* STYLES */
const COLORS = {
    background: '#050505',
    card: '#121212',
    gold: '#D4A017',
    white: '#FFFFFF',
    secondary: '#A6A6A6',
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },

    content: {
        padding: 20,
        paddingBottom: 120,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    title: {
        color: COLORS.white,
        fontSize: 34,
        fontWeight: '800',
    },

    subtitle: {
        color: COLORS.secondary,
        marginTop: 8,
        marginBottom: 24,
        lineHeight: 22,
    },

    searchContainer: {
        backgroundColor: COLORS.card,
        borderRadius: 16,
        height: 54,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },

    searchInput: {
        flex: 1,
        color: COLORS.white,
        marginLeft: 10,
        fontSize: 15,
    },

    categoriesContainer: {
        marginBottom: 24,
    },

    categoryButton: {
        backgroundColor: COLORS.card,
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 10,
    },

    categoryActive: {
        backgroundColor: COLORS.gold,
    },

    categoryText: {
        color: COLORS.white,
        fontWeight: '600',
    },

    categoryTextActive: {
        color: '#000',
    },

    sectionTitle: {
        color: COLORS.white,
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 16,
    },

    featuredCard: {
        height: 300,
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 30,
    },

    featuredImage: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },

    featuredOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        padding: 24,
        backgroundColor: 'rgba(0,0,0,0.55)',
    },

    featuredBadge: {
        color: COLORS.gold,
        fontWeight: '700',
        marginBottom: 8,
    },

    featuredTitle: {
        color: COLORS.white,
        fontSize: 28,
        fontWeight: '800',
    },

    featuredDescription: {
        color: COLORS.white,
        marginTop: 10,
        lineHeight: 22,
    },

    guideCard: {
        backgroundColor: COLORS.card,
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 18,
    },

    guideImage: {
        width: '100%',
        height: 180,
    },

    guideContent: {
        padding: 16,
    },

    guideTitle: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: '700',
    },

    guideSubtitle: {
        color: COLORS.secondary,
        marginTop: 6,
        lineHeight: 20,
    },
});
