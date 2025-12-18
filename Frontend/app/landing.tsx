import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  TextInput,
  Linking,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { BottomNavBar } from "../src/components/common/BottomNavBar";
import { useRouter } from "expo-router";
import { AppColors, AppSpacing } from "../src/styles/AppStyles";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const placeholderLogo = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=200&q=80";

const storePosts = [
  {
    id: "p1",
    store: "TU Coffee",
    storeId: "tu-coffee",
    city: "Baltimore",
    logo:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=200&q=80",
    time: "2h",
    title: "Single-origin espresso & fresh pastries every morning.",
    image:
      "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=900&q=80",
    tag: "Coffee",
    hasChat: true,
    externalLink:
      "https://www.towson.edu/fcsm/departments/computerinfosci/grad/application-development-certificate.html#",
  },
  {
    id: "p2",
    store: "African Market",
    storeId: "african-market",
    city: "Towson",
    logo:
      "https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=200&q=80",
    time: "5h",
    title: "Spices, grains, and fresh produce from across the continent.",
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80",
    tag: "Market",
    hasChat: true,
    externalLink: "https://african.market/search?q=products",
  },
  {
    id: "p3",
    store: "GoTech Hub",
    storeId: "gotech-hub",
    city: "Silver Spring",
    logo:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=200&q=80",
    time: "3h",
    title: "Gadgets, laptops, and smart accessories for every day.",
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80",
    tag: "Electronics",
    hasChat: true,
  },
  {
    id: "p4",
    store: "Style Loft",
    storeId: "style-loft",
    city: "Frederick",
    logo:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=200&q=80",
    time: "8h",
    title: "Denim, tees, and fresh fits for the weekend.",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
    tag: "Fashion",
    gallery: [
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
    ],
    hasChat: true,
  },
  {
    id: "p5",
    store: "City Home",
    storeId: "city-home",
    city: "Bethesda",
    logo:
      "https://images.unsplash.com/photo-1484100356142-db6ab6244067?auto=format&fit=crop&w=200&q=80",
    time: "6h",
    title: "Cozy home goods, lighting, and smart speakers.",
    image:
      "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=900&q=80",
    tag: "Home",
    gallery: [
      "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80",
    ],
    hasChat: true,
  },
];

const stories = [
  { id: "s1", store: "TU Coffee", storeId: "tu-coffee", logo: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=200&q=80" },
  { id: "s2", store: "African Market", storeId: "african-market", logo: "https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=200&q=80" },
  { id: "s3", store: "GoTech Hub", storeId: "gotech-hub", logo: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=200&q=80" },
  { id: "s4", store: "Style Loft", storeId: "style-loft", logo: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=200&q=80" },
  { id: "s5", store: "City Home", storeId: "city-home", logo: "https://images.unsplash.com/photo-1484100356142-db6ab6244067?auto=format&fit=crop&w=200&q=80" },
  { id: "s6", store: "HealthPlus Pharmacy", storeId: "healthplus", logo: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=200&q=80" },
  { id: "s7", store: "Fresh Fields", storeId: "fresh-fields", logo: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=200&q=80" },
  { id: "s8", store: "Metro Deli", storeId: "metro-deli", logo: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=200&q=80" },
  { id: "s9", store: "Petal & Stem", storeId: "petal-stem", logo: "https://images.unsplash.com/photo-1468327768560-75b778cbb551?auto=format&fit=crop&w=200&q=80" },
  { id: "s10", store: "Book Nook", storeId: "book-nook", logo: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=200&q=80" },
  { id: "s11", store: "Crafted Goods", storeId: "crafted-goods", logo: "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=200&q=80" },
  { id: "s12", store: "Green Grocer", storeId: "green-grocer", logo: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=200&q=80" },
];

export default function LandingPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");

  const handleOpenStore = (storeId?: string) => {
    if (storeId) {
      router.push(`/(main)/store-catalog?storeId=${encodeURIComponent(storeId)}` as any);
    } else {
      router.push("/(main)/store-catalog" as any);
    }
  };

  const submitSearch = () => {
    const term = search.trim();
    if (!term) return;
    router.push({ pathname: "/(main)/shopping", params: { tab: "products", search: term } } as any);
  };

  const handleStorePress = (post: typeof storePosts[number]) => {
    if (post.externalLink) {
      Linking.openURL(post.externalLink);
      return;
    }
    handleOpenStore(post.storeId);
  };

  return (
    <SafeAreaView style={[styles.screen, { paddingTop: insets.top + 18 }]}>
      <View
        style={[
          styles.header,
          {
            paddingLeft: AppSpacing.large + Math.max(insets.left, 12),
            paddingRight: AppSpacing.large + Math.max(insets.right, 12),
          },
        ]}
      >
        <Text style={styles.brand}>GoMarket</Text>
        <TouchableOpacity style={styles.menuButton} onPress={() => router.push("/(main)/menu" as any)}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path d="M4 7h16M4 12h16M4 17h16" stroke={AppColors.secondary} strokeWidth={2} strokeLinecap="round" />
          </Svg>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.searchCard}>
          <View style={styles.searchRow}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                d="M15.5 15.5 20 20m-2.5-7A6.5 6.5 0 1 1 5 5a6.5 6.5 0 0 1 12.5 0Z"
                stroke="#666"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <TextInput
              style={styles.searchInput}
              placeholder="Search stores or products"
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
              onSubmitEditing={submitSearch}
            />
            <TouchableOpacity onPress={submitSearch} style={styles.searchBtn}>
              <Text style={styles.searchBtnText}>Search</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.storyRow}
        >
          {stories.map((story) => (
            <TouchableOpacity key={story.id} style={styles.story} onPress={() => handleOpenStore(story.storeId)}>
              <View style={styles.storyAvatar}>
                <Image source={{ uri: story.logo || placeholderLogo }} style={styles.storyAvatarImg} />
              </View>
              <Text style={styles.storyLabel} numberOfLines={1}>
                {story.store}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.feed}>
          {storePosts.map((post) => {
            const sources = [post.image, ...(post.gallery || [])].filter(Boolean).slice(0, 2); // max 2 images
            const main = sources[0];
            const gallery = sources.slice(1, 2); // at most one extra

            return (
              <View key={post.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.avatar}>
                    <Image source={{ uri: post.logo || placeholderLogo }} style={styles.avatarImg} />
                  </View>
                  <TouchableOpacity style={{ flex: 1 }} onPress={() => handleStorePress(post)}>
                    <Text style={[styles.storeName, post.externalLink && styles.storeNameLink]}>
                      {post.store}
                    </Text>
                    <Text style={styles.meta}>
                      {post.city ? `${post.city} | ` : ""}{post.time} | {post.tag}
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.postText}>{post.title}</Text>

                {main ? (
                  <View style={styles.imageWrap}>
                    <Image source={{ uri: main }} style={styles.postImage} />
                    {gallery.length > 0 ? (
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.galleryRow}
                      >
                        {gallery.map((img, idx) => (
                          <Image key={idx} source={{ uri: img }} style={styles.galleryImage} />
                        ))}
                      </ScrollView>
                    ) : null}
                  </View>
                ) : null}

                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleOpenStore(post.storeId)}>
                    <Text style={styles.actionText}>View products</Text>
                  </TouchableOpacity>
                  {post.hasChat && (
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() =>
                        router.push({ pathname: "/(main)/support-chat", params: { store: post.storeId } } as any)
                      }
                    >
                      <Text style={styles.actionText}>Chat store</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <BottomNavBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f6f7fb",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: AppSpacing.small,
    paddingBottom: AppSpacing.small,
  },
  brand: {
    fontSize: 20,
    fontWeight: "800",
    color: AppColors.secondary,
    marginTop: 2,
  },
  inboxButton: {
    padding: 6,
  },
  menuButton: {
    padding: 6,
  },
  iconText: {
    fontSize: 18,
    color: AppColors.secondary,
  },
  // Allow content to sit below status bar comfortably
  content: {
    paddingBottom: 120,
  },
  searchCard: {
    backgroundColor: "#fff",
    marginHorizontal: AppSpacing.medium,
    marginBottom: AppSpacing.medium,
    padding: AppSpacing.medium,
    borderRadius: 16,
    shadowColor: "rgba(0,0,0,0.05)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 3,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#f7f7f7",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#222",
  },
  searchBtn: {
    backgroundColor: AppColors.secondary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchBtnText: {
    color: "#fff",
    fontWeight: "700",
  },
  shopAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: AppColors.secondary,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 12,
  },
  shopAllText: {
    color: AppColors.secondary,
    fontWeight: "700",
    fontSize: 14,
  },
  storyRow: {
    paddingHorizontal: AppSpacing.medium,
    gap: 12,
    marginBottom: AppSpacing.medium,
  },
  story: {
    width: 80,
    alignItems: "center",
    gap: 6,
  },
  storyAvatar: {
    width: 66,
    height: 66,
    borderRadius: 24,
    backgroundColor: "#ffe4e8",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: AppColors.secondary,
  },
  storyAvatarImg: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
    resizeMode: "cover",
  },
  storyInitial: {
    fontSize: 22,
    fontWeight: "800",
    color: AppColors.secondary,
  },
  storyLabel: {
    fontSize: 12,
    color: "#555",
    textAlign: "center",
  },
  feed: {
    paddingHorizontal: AppSpacing.medium,
    gap: 14,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: AppSpacing.medium,
    shadowColor: "rgba(0,0,0,0.05)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 18,
    backgroundColor: "#f4f5f7",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
    borderRadius: 18,
    resizeMode: "cover",
  },
  avatarText: {
    fontWeight: "800",
    fontSize: 16,
    color: "#2c2c2c",
  },
  storeName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#161616",
  },
  storeNameLink: {
    color: AppColors.secondary,
  },
  meta: {
    fontSize: 12,
    color: "#6b6b6b",
  },
  viewStore: {
    fontSize: 12,
    color: AppColors.secondary,
    fontWeight: "700",
    marginTop: 2,
  },
  postText: {
    fontSize: 15,
    color: "#2b2b2b",
    marginBottom: 10,
    lineHeight: 20,
  },
  imageWrap: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f2f2f2",
    marginBottom: 10,
  },
  postImage: {
    width: "100%",
    height: 220,
    resizeMode: "cover",
  },
  galleryRow: {
    gap: 10,
    paddingVertical: 8,
  },
  galleryImage: {
    width: 220,
    height: 140,
    borderRadius: 12,
    resizeMode: "cover",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 10,
    paddingBottom: 6,
    paddingHorizontal: 12,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionText: {
    fontSize: 13,
    color: "#444",
    fontWeight: "600",
  },
});
