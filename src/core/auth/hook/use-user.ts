'use client'

import { createClient } from "@/utils/supabase/client";
import { useQuery } from '@tanstack/react-query'; // Importez useQuery

const fetchUser = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

const useUser = () => {
    return useQuery({
        queryKey: ['user'], // Clé unique pour cette requête
        queryFn: fetchUser, // La fonction qui va chercher les données
    });
}

export default useUser;