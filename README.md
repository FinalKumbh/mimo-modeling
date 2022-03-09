# Face Segmentation

This project parses different parts of the face using semantic segmentation. 
The Machine learning model used in this project is called U-Net.    
The experiments folder contains application of semantic segmentation i.e. to change lip
and hair color.

Configuration of Project Environment
=====================================

1. Clone the project.
2. Install packages required.
3. Download the data set
4. Run the project.

Setup procedure
----------------
1. Clone project from GitHub
2. Install packages  
   In order to reproduce the code install the packages 
   
   1. Manually install packages mentioned in requirements.txt file or use the command.

           pip install -r requirements.txt

3. Download the required data set.  
      The data set that is used in this project CelebAMask-HQ that is available
      [here](https://github.com/switchablenorms/CelebAMask-HQ).

4. Run the project.  
     
      
Documentation for the code
===========================

1. __Pre processing__  
   This folder contains  
      
   1. Code to generate mask from the different label definitions given in the dataset and split the data
   into train, validation and test set. This is present in preprocessing/load_data.py. 
   To execute this code, within the 'preprocessing' folder enter the below
   command
           
           python load_data.py
              
   2. Augment data. The code is present in preproprocessing/augment_dataset.py.

2. __Models__  
   This folder contains the model used in this project U-Net.

3. __train.py__ 
   
   Run the code using the below command 
                    
         python train.py 
4. __test.py__  
    This file helps in visualizing segmentation for a given test image. Usage is as follows
      
         python test.py -v <visualization_method>
         
      for help on usage
      
         python app.py --help

Results
========

Below are the results obtained on the test set for the models trained in the project.

> NOTE    
   The results obtained are system specific. Due to different combinations of the neural 
   network cudnn library versions and NVIDIA driver library versions, the results can be 
   slightly different. To the best of my knowledge, upon reproducing the environment, the
   ballpark number will be close to the results obtained.

| Models                           | Accuracy (%)  | mIoU (%)  |
|----------------------------------|:-------------:|:---------:|
| U Net                            | 91.13         | 60.90     |

프로젝트 결과
============
# Dataset, 전처리

## CelebAMask-HQ 30,000장 얼굴 데이터를 수집 하여 training, test 수행

 - Input image(사람 얼굴 사진) 별 입술, 머리, 눈썹(왼쪽, 오른쪽), 눈(왼쪽, 오른쪽), 코, 등을 segmentation 한 ground truth 이미지를 함께 수집 함
 - train, validation , test set 은 7:2:1 비율
 - 원본 이미지와 ground truth 이미지는 U-net으로 train 시킴

![image](https://user-images.githubusercontent.com/88238335/157473878-42db637f-88cf-4bb3-8611-aaa060895984.png)


# U-Net 

Semantic segmentation은 이미지의 각 픽셀에 해당 클래스에 레이블을 지정하는 분류 작업으로 이를 위해
U-Net을 사용 하였다. 
U-Net은 Biomedical 분야에서 이미지 분할(Image Segmentation)을 목적으로 제안된 End-to-End 방식의 Fully-Convolutional Network 기반 모델로 자율주행 과 의료 영상 진단 등에 많이 쓰이며 대중적으로 성장했고 다양한 분할 문제에 맞게 조정되고 있다

![image](https://user-images.githubusercontent.com/88238335/157469684-c5c21b3d-a0b6-473e-ae3f-4058dea11491.png)



U-Net의 장점
적은 양의 학습 데이터로도 Data Augmentation을 활용해 여러 Biomedical Image Segmentation 문제에서 우수한 성능을 보임
컨텍스트 정보를 잘 사용하면서도 정확히 지역화함

   [참고 문헌]
   Olaf Ronneberger et al., “U-Net: Convolutional Networks for Biomedical Image Segmentation”, arXiv:1505.04597v1 [cs.CV], 18 May 2015, p.2
   Edgar Schönfeld et al., “ A U-Net Based Discriminator for Generative Adversarial Networks”,  CVPR 2020, 19 Mar 2021.



# 개선 방안
## SparseCategoricalCrossentropy→ Dice-Loss 적용
Dice-Loss 장점:  임계값을 지정하고, 이진 마스크로 변환 하는 대신 예측과 확률을 직접 사용하여 성능이 우수함.
Dice-Loss 적용 시도 했으나, tensor shape issue로 추후 다시 적용 예정

![image](https://user-images.githubusercontent.com/88238335/157472221-d953b60d-a5a7-4bef-bce4-ca593bb392ec.png)

## mIoU(Mean Intersection over union, %) : 
- Segmentation과 Object detection에서 가장 빈번하게 사용되는 성능척도
- (교집합 영역 넓이 / 합집합 영역 넓이) 에 대한 평균값

![image](https://user-images.githubusercontent.com/88238335/157472315-2e1527a7-66a7-4c04-b359-f0d9eb54d0c1.png)

# 시연 동영상

https://www.youtube.com/watch?v=HsdFs3KV4qA


