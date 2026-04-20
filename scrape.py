import pandas as pd

import os
import shutil

def get_contcar_paths(df:pd.DataFrame,output_folder:str=None, query_string=None, only_most_stable=False, generate_info=True) -> list:
    """
    Scrapes the MXene database based on a query and returns CONTCAR file paths.
    
    Parameters:
    - excel_file (str): Path to the database Excel file.
    - output_folder (str): The directory where the CONTCAR and info files will be saved.
    - query_string (str): A pandas query string to filter the dataset (e.g., "IsGap == 1").
    - only_most_stable (bool): If True, filters the results to only include the most 
                               stable structure (lowest e_rel) for each MXene.
    - generate_info (bool): If True, generates an info text file for each extracted CONTCAR.
    
    Returns:
    - list: A list of file paths to the CONTCARs for the queried MXenes.
    """

    # Filter the database based on the query string (if provided)
    if query_string:
        try:
            df = df.query(query_string).copy()
        except Exception as e:
            print(f"Error in query: {e}")
            return []
            
    # Filter for the most stable structure per MXene
    if only_most_stable and not df.empty:
        idx_most_stable = df.groupby('name')['e_rel'].idxmin()
        df = df.loc[idx_most_stable].copy()

    print(f"Found {len(df)} MXenes matching the criteria.")
    
    # Generate the file paths
    contcar_paths = []
    if output_folder: os.makedirs(output_folder, exist_ok=True)
    
    for index, row in df.iterrows():
        n = row['n']
        M_label = row['M_label']
        X_label = row['X_label']
        T_label = row['T_label']
        stack_label = row['stack_label']
        hollow_label = row['hollow_label']
        name = row['name']
        
        # Handle cases where T_label is missing (bare MXenes)
        if pd.isna(T_label) or T_label == 'None':
            T_label = "None"
            
        # Original source path
        src_path = f"./contcars/terminated/searcher_{n}_{T_label}/{stack_label}_{hollow_label}/CONTCAR_{name}"
        contcar_paths.append(src_path)
        
        # Check if the source CONTCAR exists before copying
        if os.path.exists(src_path) and output_folder:
            # Define target paths
            dest_contcar_path = os.path.join(output_folder, f"CONTCAR_{name}_{stack_label}_{hollow_label}")
            dest_info_path = os.path.join(output_folder, f"info_{name}_{stack_label}_{hollow_label}.txt")
            
            # Copy the CONTCAR file
            shutil.copy2(src_path, dest_contcar_path)
            
            # Create and write the info file
            info_content = (
                f"Name: {name}\n"
                f"n: {n}\n"
                f"M: {M_label}\n"
                f"X: {X_label}\n"
                f"T: {T_label}\n"
                f"Stacking: {stack_label}\n"
                f"Hollow: {hollow_label}\n"
            )
            
            if generate_info:
                with open(dest_info_path, "w") as info_file:
                    info_file.write(info_content)
                            
    print(f"Extraction complete. Files saved to '{output_folder}'.")
    return contcar_paths


####################
### MAIN PROGRAM ###
####################

# Target MXenes (combinations to extract)
target_n = [1]          # List with desired n values (e.g., [1, 2, 3])
target_M = ['Mo']       # List with desired M elements (e.g., ['Ti', 'V', 'Mo'])
target_X = ['C']        # List with desired X elements (e.g., ['C', 'N'])
target_T = ['OH','NH','H', 'O', 'S', 'Se', 'Te', 'F', 'Cl', 'Br', 'I']

most_stable = True              # Whether to extract only the most stable structure (lowest e_rel) for each MXene
out_folder = "extracted/"       # Output folder for the extracted CONTCARs and info files
generate_info = False           # Whether to generate info files for each extracted CONTCAR
query = None                    # Optional pandas query string to further filter the dataset (e.g., "IsGap == 1")


db_file = "./database.xlsx"
df = pd.read_excel(db_file, sheet_name='database') 

df = df[
    (df['n'].isin(target_n)) &
    (df['M_label'].isin(target_M)) &
    (df['X_label'].isin(target_X)) &
    (df['T_label'].isin(target_T))
].copy()

paths_all_stable = get_contcar_paths(df, output_folder=out_folder, only_most_stable=most_stable, generate_info=generate_info, query_string=query)
for i in paths_all_stable:
    print(i)